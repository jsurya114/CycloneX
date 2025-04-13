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
const userController = {
   

    showUserProfile:async (req,res,next) => {
try
{

 
    const userId= req.params.userId
const user = await User.findById(userId)

const users= req.user.id
const wishlist = await Wishlist.countDocuments({ user: userId });
   let cartfind = await Cart.findOne({user: userId})
            const cartCount = cartfind?.items.length
let orderCount=await Order.countDocuments({user:userId})
let reviewCount =await Review.countDocuments({user:userId})

let couponCount = await Coupon.countDocuments({refferedBy:{$in:[userId]}})
const returnOrderCount = await Order.countDocuments({ user: userId, orderStatus: "returned" })
  const {productId}=req.body
  const product= await Product.findById(productId)
if(!userId) return res.status(404).json({success:false,message:'invalid input'})
    const orders = await Order.find({ user: userId })
.populate("items.product")
.populate("address")
.sort({ timestamp: -1 })
let newUserrefferal =await User.findOne({user:userId}) 
        res.status(200).render('userprofile',{user,users,product: product || { _id: '' },wishlistCount:wishlist,cartCount,orderCount,returnOrderCount,orders,reviewCount,refferalCode:user.refferalCode,newUserrefferal,couponCount})}
        catch(error){
            next(error)
        }
    },
    userAddress:async (req,res,next) => {
    
try {
   
    
    const userId= req.params.userId
    if(!userId) return res.status(404).json({success:false,message:'invalid input'})

  const {fullName,email,mobile,country,state,address,pincode,landmark}=req.body  

  
  
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

userprofileUpload:async (req,res,next) => {
    try {
        const userId = req.params.userId

        if(!userId){
            return res.status(400).json({success:false,message:'user id required'})

        }

   
if(!req.file){
    return re.status(400).json({success:false,message:'no image file provided'})
}



  const profileImagePath = `/backend/imgs/profiles/${req.file.filename}`

  
  const updatedUser = await User.findByIdAndUpdate(userId,{profileImage:profileImagePath},
    {new:true}
  )

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User not found' });
}
return res.status(200).json({ 
    success: true, 
    message: 'Profile image updated successfully',
    profileImage: profileImagePath
})

    } catch (error) {
        console.error('Profile upload error:', error)

        next(error)
    }
},

    aboutAs:async (req,res,next) => {
         try {
    
              const token = req.cookies.token
              const decoded =jwt.verify(token, process.env.JWT_SECRET)
              const userId = decoded.id
          
              if(!userId){
                  return res.status(400).json({success:false,message:'Unauthorized'})
              }
              const user = await User.findById(userId)
                 let cartfind = await Cart.findOne({ user: userId })
                          const cartCount = cartfind.items.length
          return res.status(200).render('about',{user,cartCount})
         } catch (error) {
          next(error)
         }
        }
  
        
    } 
    module.exports=userController