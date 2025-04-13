const Product=require('../../models/productModel')
const Cart = require('../../models/cartModel')
const Address = require('../../models/addressModel')
const jwt = require('jsonwebtoken')
const User = require('../../models/userModel')
const Order = require('../../models/orderModel')
const Coupon = require('../../models/couponModel')
const Razorpay = require('razorpay')
const Wishlist = require('../../models/wislistModel')
const { path } = require('../../models/offerModel')
const mongoose=require("mongoose")
require('dotenv').config();
const checkoutController = {

    showcheckOut:async (req,res) => {
        const token = req.cookies.token
     const decoded=jwt.verify(token,process.env.JWT_SECRET)
 const userId= decoded.id;

if(!userId){
return res.status(400).json({success:false,message:'invalid input'})
}



const address = await  Address.find({user:userId})




 const user=await User.findById(userId);

if(!user){
res.status(404).redirect('/login')
 }


   let cartfind = await Cart.findOne({user: userId})
            const cartCount = cartfind.items.length
 let cart = await Cart.findOne({ user: user._id }).populate({
    path: 'items.product',
    populate: [
        { path: 'brands' },   
        { path: 'category' }     
    ]
});
if(!cart||cart.length===0){
return res.status(400).json({success:false,message:'cart is empty'})
}

const now = Date.now()
const coupons = await Coupon.find({
    $or: [
        { user: userId }, // ✅ Coupons assigned to this user
        { user: { $size: 0 } } // ✅ General coupons with an empty userId array
    ],
 }).lean();



let standartShipping=100

const shippingMethod = (req.query.shipping||'standard').toLowerCase()




let subtotal = 0;
let discount = 0;
let taxRate = 0.18;
let tax = 0;           // ✅ Moved tax declaration here
let finalTotal = 0;    // ✅ Added default value here
let shippingCharge = 0;
let freeShipping =false

 if (cart && cart.items.length > 0) {
    cart.items = cart.items.map(item => {
        const itemObj = item.toObject();

        const productOffer = item.product.offer || 0;
        const categoryOffer = (item.product.category && item.product.category.offer) ? item.product.category.offer : 0;
        const maxOffer = Math.max(productOffer, categoryOffer) || 0;

        // Ensure price is valid
        const originalPrice = item.product.price || 0;
        const salePrice = maxOffer > 0 ? originalPrice * (1 - maxOffer / 100) : originalPrice;
        const itemSubtotal = salePrice * (item.quantity || 1);

        return {
            ...itemObj,
            maxOffer,
            salePrice,
            subtotal:itemSubtotal
        };
    });

    subtotal = cart.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    tax = subtotal * taxRate
  
    freeShipping = subtotal>=5000
   if(shippingMethod==='standard'&&freeShipping){
    shippingCharge=0
   
   }
    
     finalTotal = Math.floor(subtotal + tax + shippingCharge) 
}


        res.render('checkout',{
      
            user,
        address,
        cart: cart || null,
        cartCount,
        subtotal: isNaN(subtotal) ? 0 : subtotal,
        items: cart.items,
        tax: isNaN(tax) ? 0 : tax,
        discount,
        shippingCharge: isNaN(shippingCharge) ? 0 : shippingCharge,
        finalTotal,
        discountCode: "",
        shippingOptions: {
            standard: standartShipping,

        },
        selectedShipping: shippingMethod,
        freeShipping,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
        coupons
        })
    },


    applyCoupon:async (req,res,next) => {
        try {
            const token = req.cookies.token
            const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const userId= decoded.id;
       
       if(!userId){
       return res.status(400).json({success:false,message:'invalid input'})
       }
    
        const {couponCode,totalAmount,shippingCharge}=req.body
        const coupon = await Coupon.findOne({couponCode:couponCode,isBlocked:false,expireDate:{$gt:new Date}})
     
if(!coupon){
    return res.status(404).json({success:false,message:'coupon expired'})
}


// const userObjectId = new mongoose.Types.ObjectId(userId); // Convert to ObjectId


if(coupon.usedBy&&coupon.usedBy.includes(userId)){
    return res.status(400).json({
        success: false,
        message: "You have already used this coupon."
    })
}
if(totalAmount<coupon.minAmount){
    return res.status(400).json({success:false,message:`This coupon is applicable on orders above ₹${coupon.minAmount}. Please add more items to your cart.`})
}
const discount = Math.min(coupon.offerPrice, totalAmount,shippingCharge);
const total = totalAmount - discount





await Coupon.findByIdAndUpdate()
return res.status(200).json({success:true,discount,couponId:coupon._id,total})
        } catch (error) {
         
            next(error)
            
        }




    },

     
      


   
}
module.exports=checkoutController