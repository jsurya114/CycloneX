const User = require('../../models/userModel')
const Address = require('../../models/addressModel')
const Product =require('../../models/productModel')
const jwt = require('jsonwebtoken')

const addressController={
    getUserAddress:async (req,res,next) => {
        try {
           const userId = req.params.userId
           if(!userId){
            return res.status(400).json({success:false,message:'invalid input'})
           } 
           const user= await User.findById(userId)
           if(!user) {
            return res.status(404).json({success:false,message:'User not found'})

           }
           const allAddress = await Address.find({user:userId})

           return res.status(200).json({success:true,allAddress})


        } catch (error) {
          next(error)  
        }
    },


specificAddress:async (req,res,next) => {
    try {
        const {userId,addressId}=req.params
if(!userId||!addressId){
    return res.status(404).json({success:false,message:'invalid input'})
}
const address = await Address.findOne({_id:addressId,user:userId})
if(!address){
    return res.status(404).json({success:false,message:'not found'})
}

return res.status(200).json({success:true,address})


    } catch (error) {
        next(error)
    }
},
manageAddress:async (req,res,next) => {
    try {
const userId = req.params.userId
if(!userId){
    return res.status(404).json({success:false,message:'invalid input'})
}
const {fullName,email,mobile,country,state,address,pincode,landmark ,addressId}=req.body
const errors={}

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
    if (landmark.length > 50) {
        errors.landmark = 'Landmark is too long (max 50 characters)';
    }
}

if(Object.keys(errors).length>0){
    return res.status(400).json({success:false,message:'Validation failed',errors})
}

if(addressId){
    const existingAddress= await Address.findOne({_id:addressId,user:userId})

    if(!existingAddress){
        return res.status(404).json({success:false,message:'Address not found'})
    }
existingAddress.fullname=fullName
existingAddress.country=country
existingAddress.state=state
existingAddress.pincode = pincode
existingAddress.address = address
existingAddress.landmark = landmark || ''
existingAddress.mobileNum = mobile
existingAddress.email = email


await existingAddress.save()
return res.status(200).json({success:true,message:'Address updated successfully'})
}else{
    const newAddress = new Address({
        fullname: fullName,
        country,
        state,
        address,
        pincode,
        landmark: landmark || '',
        mobileNum: mobile,
        email,
        user: userId
    });

    await newAddress.save()
    return res.status(200).json({success:true,message:'Address added sucessfully'})

}
    } catch (error) {
next(error)
    }
},

deleteAddress:async(req,res,next)=>{
    try {
         
        const {userId,addressId}=req.params
        if(!userId||!addressId){
            return res.status(404).json({success:false,message:'invalid input'})
        }

const address = await Address.findByIdAndDelete({_id:addressId,user:userId})

if(!address){
    return res.status(404).json({success:false,message:'Address not found'})
}
return res.status(200).json({success:true,message:'Address deleted successfully'})


    } catch (error) {
        next(error) 
    }
}

}
module.exports= addressController