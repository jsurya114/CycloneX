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
    
     finalTotal = subtotal + tax + shippingCharge;
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






return res.status(200).json({success:true,discount,couponId:coupon._id,total})
        } catch (error) {
         
            next(error)
            
        }




    },

     userAddress:async (req,res,next) => {
        
    try {
       
        const {fullName,email,mobile,country,state,address,pincode,landmark, userId}=req.body  
        
        
        console.log('user',userId);
        if(!userId) return res.status(404).json({success:false,message:'invalid input'})
    
    
      console.log('fullName,email,mobile,country,state,address,pincode,landmark',fullName,email,mobile,country,state,address,pincode,landmark,userId)
      
      const errors = {};
                
      // Full Name validation
      if (!fullName || fullName.trim() === '') {
          errors.fullName = 'Full name is required';
      } else if (fullName.length < 3) {
          errors.fullName = 'Full name must be at least 3 characters';
      } else if (fullName.length > 50) {
          errors.fullName = 'Full name must not exceed 50 characters';
      } else if (!/^[a-zA-Z\s.]+$/.test(fullName)) {
          errors.fullName = 'Full name should contain only letters, spaces, and periods';
      }
      
      // Email validation
      if (!email || email.trim() === '') {
          errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.email = 'Please enter a valid email address';
      }
      
      // Mobile validation
      if (!mobile || mobile.trim() === '') {
          errors.mobile = 'Mobile number is required';
      } else if (!/^\d{10}$/.test(mobile)) {
          errors.mobile = 'Mobile number should be 10 digits';
      }
      
      // Country validation
      if (!country || country.trim() === '') {
          errors.country = 'Country is required';
      } else if (country.length < 2) {
          errors.country = 'Country name is too short';
      } else if (!/^[a-zA-Z\s]+$/.test(country)) {
          errors.country = 'Country should contain only letters and spaces';
      }
      
      // State validation
      if (!state || state.trim() === '') {
          errors.state = 'State is required';
      } else if (state.length < 2) {
          errors.state = 'State name is too short';
      } else if (!/^[a-zA-Z\s]+$/.test(state)) {
          errors.state = 'State should contain only letters and spaces';
      }
      
      // Address validation
      if (!address || address.trim() === '') {
          errors.address = 'Address is required';
      } else if (address.length < 5) {
          errors.address = 'Address is too short';
      } else if (address.length > 200) {
          errors.address = 'Address is too long (max 200 characters)';
      }
      
      // Pincode validation
      if (!pincode || pincode.trim() === '') {
          errors.pincode = 'Pincode is required';
      } else if (!/^\d{6}$/.test(pincode)) {
          errors.pincode = 'Pincode should be 6 digits';
      }
      
      // Landmark validation (optional, but validate if provided)
      if (landmark && landmark.trim() !== '') {
          if (landmark.length > 100) {
              errors.landmark = 'Landmark is too long (max 100 characters)';
          }
      }
      
      // If there are validation errors, return them
      if (Object.keys(errors).length > 0) {
          return res.status(400).json({
              success: false, 
              message: 'Validation failed',
              errors
          });
      }
      
    
    
    
    
      const existingAddress = await Address.findOne({ user: userId });
    
      if (existingAddress) {
          // Update existing address
          existingAddress.fullname = fullName;
          existingAddress.country = country;
          existingAddress.state = state;
          existingAddress.address = address;
          existingAddress.pincode = pincode;
          existingAddress.landmark = landmark || '';
          existingAddress.mobileNum = mobile;
          existingAddress.email = email;
    
          await existingAddress.save();
          return res.status(200).json({ success: true, message: 'Address updated successfully' });
      } else {
          // Create new address (existing logic)
          const newAddress = new Address({
              fullname: fullName,
              country,
              state,
              address,
              pincode,
              landmark,
              mobileNum: mobile,
              email,
              user: userId
          });
          await newAddress.save();
          return res.status(201).json({ success: true, message: 'Address added successfully' });
      }
     } catch (error) {
        next(error)
    }
    
        },
      


   
}
module.exports=checkoutController