const Product = require('../../models/productModel')
const Cart = require('../../models/cartModel')
const Category = require('../../models/categoryModel')

const User = require('../../models/userModel')
const jwt = require('jsonwebtoken')
const Wishlist = require('../../models/wislistModel')
const { category } = require('../admin/categoryController')
const userEnsure = require('../../middlewares/userEnsure')
const cartController = {
    showCartPage: async (req, res, next) => {
        try {
            const token = req.cookies.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const userId = decoded.id;
            const user = await User.findById(userId);
            let cartfind = await Cart.findOne({ user: userId })
            const cartCount = cartfind.items.length
            let cart = await Cart.findOne({ user: user._id })
                .populate({
                    path: 'items.product',
                    populate: {
                        path: 'category' // Correct way to populate nested category data
                    }
                });


            let subtotal = 0;
            let discount = 0;
            let taxRate = 0.18;
            let tax = 0;
            let total = 0;
            let shippingCharge = 300

            if (cart && cart.items.length > 0) {
                cart.items = cart.items.map(item => {
                    const productOffer = item.product.offer || 0;
                    const categoryOffer = (item.product.category && item.product.category.offer) ? item.product.category.offer : 0;
                    const maxOffer = Math.max(productOffer, categoryOffer) || 0;

                    // Ensure price is valid
                    const originalPrice = item.product.price || 0;
                    const salePrice = maxOffer > 0 ? originalPrice * (1 - maxOffer / 100) : originalPrice;
                    const itemSubtotal = salePrice * (item.quantity || 1);

                    return {
                        ...item.toObject(),
                        maxOffer,
                        salePrice,
                        subtotal: itemSubtotal // ✅ Save subtotal per item
                    };
                });


                // ✅ Store total subtotal in cart
                cart.totalSubtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
                await cart.save();
            }
            let taxAmount = cart.totalSubtotal * taxRate
            let finalTotal = cart.totalSubtotal + taxAmount

            if (!cart || cart.items.length === 0) {
                cart = null; // Clear the cart reference
                subtotal = 0;
                taxAmount = 0;
                finalTotal = 0;
            }


            const product = await Product.find({ isDeleted: false }).populate('category').populate('brands')




            let referenceProduct = cart?.items?.length > 0 ? cart.items.product : null

            let relatedProducts = []
            if (referenceProduct) {
                relatedProducts = await Product.find({
                    category: referenceProduct.category,
                    brands: referenceProduct.brands,
                    _id: { $ne: referenceProduct._id }
                })
                    .limit(10)
                    .populate('brands');
            }
            res.status(200).render('addtocart', {
                user,
                product,
                cart: cart || null,  // Explicitly set cart to null if not found
                subtotal,
                tax,
                discount,
                shippingCharge,
                total,
                relatedProducts, cartCount,
                taxAmount,
                finalTotal
            });
        } catch (error) {
            next(error);
        }
    },

    addToCart: async (req, res, next) => {
        try {
            const { productId, quantity } = req.body
            const userId = req.user?._id
            if(!userId){
                return res.status(400).json({success:false, message: "Please login to add to cart"});
            }
            if (quantity <= 0) {
                return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
            }
            const product = await Product.findById(productId).populate('category')

            if (product.isDeleted == true) {
                return res.status(400).json({ success: false, message: 'product is unavailable' })
            }
            if (product.category && product.category.isBlocked === true) {
                return res.status(400).json({ success: false, message: 'This product is unavailable' });
            }



            if (quantity > product.stock) {
                return res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock` });
            }

            let cart = await Cart.findOne({ user: userId }).populate('items.product')


            if (!cart) {
                cart = await new Cart({ user: userId, items: [] })
                await cart.save();

            }



            //removing the wislist when its in the cart

            const wishlist = await Wishlist.findOne({ user: userId })
            if (wishlist && wishlist.product.includes(productId)) {
                wishlist.product = wishlist.product.filter(pId => pId.toString() !== productId.toString());
                await wishlist.save()
            }


            const existingItem = cart.items.find(item => item.product._id.toString() === productId)
            if (existingItem) {

                return res.status(400).json({success: false, message:"Product already added to your cart!"})
            }
            else {
                cart.items.push({
                    product: productId,
                    //  productName: product.productName,
                    quantity: parseInt(quantity)
                })

            }

            await cart.save()
            res.status(201).json({ success: true, message: 'Product added to cart' })
        } catch (error) {
            next(error)
        }
    },

    //remove the product
    removeFromCart: async (req, res, next) => {
        try {
            const { productId } = req.params
            const userId = req.user._id
            let cart = await Cart.findOne({ user: userId })
            if (!cart) return res.status(404).json({ success: false, message: "Cart not found" })

            cart.items = cart.items.filter(item => item.product.toString() !== productId)

            await cart.save()
            res.status(200).json({ success: true, message: 'Product removed from cart' })

        } catch (error) {
            next(error)
        }
    },

    updateQuantity: async (req, res, next) => {
        try {
            const { productId } = req.params;
            const { quantity } = req.body;
            const userId = req.user._id;

            if (!quantity || isNaN(quantity) || quantity <= 0) {
                return res.status(400).json({ success: false, message: " quantity must be atleast one." });
            }


            const product = await Product.findById(productId)
            if (quantity > product.stock) {
                return res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock` });
            }

            let cart = await Cart.findOne({ user: userId });
            if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

            const item = cart.items.find(item => item.product.toString() === productId);
            if (!item) return res.status(404).json({ success: false, message: "Product not in cart" });

            item.quantity = parseInt(quantity)
            cart.items = cart.items.map(item => {
                const productOffer = item.product.offer || 0
                const categoryOffer = (item.product.category && item.product.category.offer) ? item.product.category.offer : 0
                const maxOffer = Math.max(productOffer, categoryOffer) || 0



                const originalPrice = item.product.price || 0
                const salePrice = maxOffer > 0 ? originalPrice * (1 - maxOffer / 100) : originalPrice
                const itemSubtotal = salePrice * (item.quantity || 1)
                return {
                    ...item.toObject(),
                    maxOffer,
                    salePrice,
                    subtotal: itemSubtotal
                }
            })
            cart.totalSubtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);


            const taxRate = 0.18;
            const taxAmount = cart.totalSubtotal * taxRate;
            const finalTotal = cart.totalSubtotal + taxAmount;
            const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');

            await cart.save();

            res.json({
                success: true,
                message: "Product quantity updated",
                subtotal: cart.totalSubtotal,
                tax: taxAmount,
                total: finalTotal, updatedCart
            });
        } catch (error) {
            next(error);
        }
    },

  


}
module.exports = cartController