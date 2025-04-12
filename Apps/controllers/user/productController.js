const Category = require('../../models/categoryModel')
const Brand = require('../../models/brandModel')
const Product =require('../../models/productModel')
const { category } = require('../admin/categoryController')
 const User= require('../../models/userModel')
 const Cart = require('../../models/cartModel')
 const Order = require('../../models/orderModel')
 const Address = require('../../models/addressModel')
 
const jwt = require('jsonwebtoken')
const Review = require('../../models/reviewModel')
const Wishlist=require("../../models/wislistModel")
const Coupon =require('../../models/couponModel')

const productController={
    
 productDetails:async (req, res,next) => {
        try {
            const id =req.params.id
const {search}=req.query
let filter ={}
const token = req.cookies.token;

let userId = null;
let user = null;
let cartCount = 0;

if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
    user = await User.findById(userId);
    
    let cartfind = await Cart.findOne({ user: userId });
    cartCount = cartfind ? cartfind.items.length : 0;
}

                        const categories = await Category.find({});
                                   const brands = await Brand.find({});
        const product = await Product.findById(id).populate('category').populate('brands')
        const review = await Review.find({ product: id }).populate('user', 'name')
        const productOffer = product.offer || 0; // If no offer, assume 0%
        const categoryOffer = (product.category && product.category.offer) ? product.category.offer : 0; 
        const maxOffer = Math.max(productOffer, categoryOffer); // Get the best discount
        
        const salePrice = product.price * (1 - maxOffer / 100); // Apply discount correctly
        
        let cartfind = await Cart.findOne({user: userId})
               
                 const breadcrumbs = [
                    { name: 'Home', url: '/' },
                    product.category ? { name: product.category.name, url: `/home?categoryFilter=${encodeURIComponent(product.category.name)}` } : { name: 'Category', url: '#' },
                    product.brands ? { name: product.brands.name, url: `/home?brandsFilter=${encodeURIComponent(product.brands.name)}` } : { name: 'Brand', url: '#' },
                    { name: product.productName, url: `/productdetails/${product._id}` }
                  ];
                  


        const relatedProducts= await Product.find({
            category:product.category,
         
            _id:{$ne:product._id},
           

        }).limit(10).populate('brands')
        if (search) {
            filter.$or = [
                { productName: { $regex: search.trim(), $options: "i" } },
                { 'brands.name': { $regex: search.trim(), $options: "i" } },
                { 'category.name': { $regex: search.trim(), $options: "i" } },
            ];
        }



        res.status(200).render('productdetails',{product, user: user ? user._id : null,
            relatedProducts, breadcrumbs,brands,cartCount,review,maxOffer,salePrice})
        
        } catch (error) {
            console.error(error)
            next(error)
        }




    },
}
module.exports=productController