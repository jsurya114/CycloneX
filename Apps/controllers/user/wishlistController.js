const Product = require('../../models/productModel')
const Cart = require('../../models/cartModel')
const Category = require('../../models/categoryModel')

const User = require('../../models/userModel')
const jwt = require('jsonwebtoken')
const Wishlist = require('../../models/wislistModel')
const { category } = require('../admin/categoryController')
const userEnsure = require('../../middlewares/userEnsure')

const wishlistController={
  showWhishlistPage: async (req, res, next) => {
        try {
            const token = req.cookies.token;

            const { categoryFilter, brandsFilter, } = req.body
            if (!token) {
                return res.status(400).redirect('/')
            }


            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id
            const user = await User.findById(userId)


            if (!user) {
                return res.status(404).render('error', { message: 'User not found' });
            }
            let cartCount = await Cart.countDocuments({ user: userId })
            const wishlist = await Wishlist.findOne({ user: user._id }).populate({
                path: 'product',
                select: 'name price mainImage brands'
            })


            let breadcrumbs = [
                { name: 'Home', url: '/' },
                { name: 'Wishlist', url: '/wislist' }
            ];

            if (categoryFilter) {
                breadcrumbs.push({
                    name: categoryFilter,
                    url: `/wislist?categoryFilter=${encodeURIComponent(categoryFilter)}`
                });
            }

            if (brandsFilter) {
                breadcrumbs.push({
                    name: brandsFilter,
                    url: `/wislist?brandsFilter=${encodeURIComponent(brandsFilter)}`
                });
            }
            let cart = await Cart.findOne({ user: user._id }).populate('items.product');
            res.status(200).render('wishlist', {
                user,
                cart,
                wishlist,
                breadcrumbs,
                cartCount
            })
        } catch (error) {
            next(error)
        }
    },

    addToWishlist: async (req, res, next) => {
        try {
            const { productId } = req.body
            const userId = req.user._id
            const product = await Product.findById(productId)

            let wishlist = await Wishlist.findOne({ user: userId })

            if (!wishlist) {
                wishlist = new Wishlist({ user: userId, product: [] })
            }



            if (wishlist.product.includes(productId)) {
                return res.status(400).json({ success: false, message: 'product already in your wishlist' })
            }

            const wishlistItems = wishlist.product.map(id => id.toString())
            if (!wishlist || !wishlist.product) {
                return res.json({ success: true, wishlistItems: [] });
            }



            wishlist.product.push(productId)

            await wishlist.save()
            res.status(201).json({ success: true, message: 'Product added to Wishlist', wishlistItems })

        } catch (error) {
            next(error)
        }
    },
    removeFromWishlist: async (req, res, next) => {
        try {
            const { productId } = req.params;
            const userId = req.user._id;

            let wishlist = await Wishlist.findOne({ user: userId });
            if (!wishlist) {
                return res.status(404).json({ success: false, message: "Wishlist not found" });
            }

            if (!wishlist.product || !Array.isArray(wishlist.product)) {
                wishlist.product = [];
                await wishlist.save();
                return res.status(200).json({ success: true, message: 'Product not in wishlist' });
            }

            wishlist.product = wishlist.product.filter(products => products.toString() !== productId);
            await wishlist.save();

            return res.status(200).json({ success: true, message: 'Product removed from wishlist' });
        } catch (error) {
            next(error);
        }
    }

}
module.exports=wishlistController