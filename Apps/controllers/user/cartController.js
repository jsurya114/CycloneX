const Product=require('../../models/productModel')
const Cart = require('../../models/cartModel')
const User = require('../../models/userModel')
const jwt = require('jsonwebtoken')
const { productsoftdelete } = require('../admin/productloader')
const cartController={
    showCartPage: async (req, res, next) => {
        try {
            const token = req.cookies.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const userId = decoded.id;
            const user = await User.findById(userId);
            
            let cart = await Cart.findOne({ user: user._id }).populate('items.product');
    
            let subtotal = 0;
            let discount = 0;
            let taxRate = 0.18;
            let tax = 0;
            let total = 0;
    
            if (cart && cart.items.length > 0) {
                cart.items.forEach(item => {
                    subtotal += item.product.price * item.quantity;
                });
    
                if (subtotal > 19000) {
                    discount = subtotal * 0.19;
                }
    
                tax = subtotal * taxRate;
                total = subtotal + tax - discount;
            }
    
let referenceProduct= cart?.items?.length>0?cart.items[0].product:null

let relatedProducts=[]
if(referenceProduct){
    relatedProducts= await Product.find({
        category:referenceProduct.category,
        brands:referenceProduct.brands,
        _id:{$ne:referenceProduct._id}
    })
    .limit(10)
    .populate('brands');
}
            res.status(200).render('addtocart', {
                user,
                cart: cart || null,  // Explicitly set cart to null if not found
                subtotal,
                tax,
                discount,
                total,
                relatedProducts
            });
        } catch (error) {
            next(error);
        }
    },

    addToCart:async (req,res,next) => {
        try {
            const {productId,quantity}=req.body
            const userId = req.user._id
            if (quantity <= 0) {
                return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
            }
            const product =await Product.findById(productId)
            
            
            if (quantity > product.stock) {
                return res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock` });
            }

            let cart =await Cart.findOne({user:userId})
            if(!cart) {
                cart =await new Cart({user:userId,items:[]})
                await cart.save()

            }
           // console.log(cart,userId,productId,quantity)
    
          
        const existingItem = cart.items.find(item=>item.product.toString()===productId)
        if(existingItem){
        
            if(existingItem.quantity+quantity>product.stock){
           
                return res.status(400).json({ success: false, message: "Not enough stock available" })
            }
            existingItem.quantity+=quantity
        }
        else{
          //  console.log(product,'hii',productId)
            cart.items.push({product: productId,   
                //  productName: product.productName,
                quantity: parseInt(quantity)})
                
        }
        
        await cart.save()
        res.status(201).json({success: true, message: 'Product added to cart'})
        } catch (error) {
            console.log(error)
           next(error)
        }
    },

    //remove the product
    removeFromCart:async (req,res,next) => {
try {
    const {productId}=req.params
    const userId=req.user._id
    let cart = await Cart.findOne({user:userId})
    if(!cart) return res.status(404).json({success: false, message: "Cart not found"})

cart.items=cart.items.filter(item=>item.product.toString()!==productId)

await cart.save()
res.status(200).json({success: true, message: 'Product removed from cart'})

} catch (error) {
    next(error)
}        
    },

    updateQuantity: async (req, res, next) => {
        try {
            const { productId } = req.params;
            const { quantity } = req.body;
            const userId = req.user._id;
      
            if (quantity <= 0) {
                return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
            }


            const product =await Product.findById(productId)
            if (quantity > product.stock) {
                return res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock` });
            }

            let cart = await Cart.findOne({ user: userId });
            if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
      
            const item = cart.items.find(item => item.product.toString() === productId);
            if (!item) return res.status(404).json({ success: false, message: "Product not in cart" });
      ``
            item.quantity = parseInt(quantity);
            await cart.save();
      
            res.json({ success: true, message: "Product quantity updated", cart });
        } catch (error) {
            next(error);
        }
      }
      

}
module.exports=cartController