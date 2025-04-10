const jwt = require('jsonwebtoken');
const Cart = require('../../models/cartModel')
const generateOTP = require('../../services/otp');
const User = require('../../models/userModel');
const sendEmail =require('../../services/email')
const settingController={
    userSettings:async (req,res,next) => {
        try {

            const token = req.cookies.token
            const decoded=jwt.verify(token,process.env.JWT_SECRET)

            const userId= decoded.id;
            const user=await User.findById(userId);
           let cartfind = await Cart.findOne({user: userId})
                    const cartCount = cartfind.items.length

            return res.status(200).render('settings',{user,cartCount})
        } catch (error) {
            next(error)
        }
    },


  // sending otp to the new email
sendOtps:async (req,res,next) => {
   try {
    const {email:newEmail}=req.body

    
    if(!newEmail){
        return res.status(400).json({success:false,message:'email is required'})
    }
    const token = req.cookies.token
    const decoded=jwt.verify(token,process.env.JWT_SECRET)

    const userId= decoded.id;
  

    const user = await User.findById(userId)
    if(!user){
        return res.status(404).json({success:false,message:'user not found'})
    }
    const otp = generateOTP()
    const otpExpiry = Date.now() + 1 * 60 * 1000
    await User.findByIdAndUpdate(user._id,{otp,otpExpiry})
    
    await sendEmail(newEmail, 'Your OTP for Password Reset', 
        `<p>Your OTP is: <strong>${otp}</strong></p><p>It will expire in 1 minute.</p>`
    )
    const newToken = jwt.sign({id:user._id,email:user.email,updateEmail:true},   process.env.JWT_SECRET, 
        { expiresIn: '1h' }

    )
    res.cookie('token', newToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 1 * 60 * 24 * 1000 //  1h
    })
    return res.status(200).json({success:true,message:'otp sent to email for update email'})




   } catch (error) {
    next(error)
   }
},

//verify the otp and update the email
verifyAndUpdate:async (req,res,next) => {
   try{   const token = req.cookies.token
      const decoded=jwt.verify(token,process.env.JWT_SECRET)
const userId = decoded.id
      if(!token){
        return res.status(401).json({succes:false,message:'Unauthorized:you cant access '})
      }
      const {otp,email:newEmail}=req.body
      const user= await User.findById(userId)
      if(!user||user.otp!==otp){
        return res.status(400).json({success:false,message:'invalid otp please check your otp'})
      }
      await User.findByIdAndUpdate(userId,{email:newEmail,otp:null ,otpExpiry:null})
      return res.status(200).json({success:true,message:'otp verification successfull'})
    }catch(error){
next(error)
    }


},


//password settings 

passwordOtpverify:async (req,res,next) => {
    try {



        const token = req.cookies.token
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const userId = decoded.id
if(!token){
    return res.status(400).json({success:false,message:'Unauthorized:you cant access '})
}


        const {otp}=req.body
const user=await User.findById(userId)
if (!otp) {
            return res.status(400).json({ success: false, message: 'OTP is required' });
        }

if(!user||user.otp!==otp){
    return res.status(404).json({success:false,message:'invalid otp please check your otp'})
}

await User.findByIdAndUpdate(userId,{password:user.tempPassword,otp:null ,otpExpiry:null,tempPassword:null})
return res.status(200).json({success:true,message:'otp verification successfull'})


    } catch (error) {
       next(error) 
    }
},
 
passwordSentOtp:async (req,res,next) => {
    try {
       const {newPassword}=req.body
       if(!newPassword){
        return res.status(400).json({success:false,message:'password is required'})
       } 
if(newPassword.length<8){
    return res.status(400).json({success:false,message:'password must be at least 8 characters long'})
}
if (!/(?=.*[a-z])/.test(newPassword)) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one lowercase letter' });
}

if (!/(?=.*\d)/.test(newPassword)) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one number' });
}

       const token = req.cookies.token
if(!token){
    return res.status(401).json({ success: false, message: 'Unauthorized: you cannot access this resource' })}

       const decoded=jwt.verify(token,process.env.JWT_SECRET)
   
       const userId= decoded.id;
     
   
       const user = await User.findById(userId)

       if(!user){
        return res.status(404).json({success:false,message:'user not found'})
    }

    const otp = generateOTP()
    const otpExpiry = Date.now() + 1 * 60 * 1000
    await User.findByIdAndUpdate(user._id,{otp,otpExpiry,tempPassword:newPassword})
    
    await sendEmail(user.email, 'Your OTP for Password Reset', 
        `<p>Your OTP is: <strong>${otp}</strong></p><p>It will expire in 1 minute.</p>`
    )
    const newToken = jwt.sign(
        { id: user._id, otp, otpExpiry, tempPassword: newPassword }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
    );
    
    res.cookie('token', newToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 1 * 60 * 24 * 1000 //  1h
    })
    return res.status(200).json({success:true,message:'otp sent to email for update password'})
    } catch (error) {
        next(error)
    }
}




   

}
module.exports=settingController