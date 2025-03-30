require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../../models/userModel');
const sendEmail=require('../../services/email')
const nodemailer = require('nodemailer');
const Cart = require('../../models/cartModel')
const jwt = require('jsonwebtoken');
const Product = require('../../models/productModel')
const Category = require('../../models/categoryModel')
const generateOTP = require('../../services/otp');
const RefferalCode = require('../../services/referral');
const Coupon = require('../../models/couponModel')


// Check if email credentials exist
if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    console.error("❌ Email credentials are missing. Check your .env file!");
    process.exit(1);
}

// Ensure JWT secret is available
if (!process.env.JWT_SECRET) {
    console.error("❌ JWT secret is missing. Please add JWT_SECRET to your .env file!");
    process.exit(1);
}



const authController = {
landing:async (req,res,next) => {
  try {
    
                           
                    
                             const categories = await Category.find({});
                             const product = await Product.find({})
    return res.status(200).render('landing',{categories,product})
  } catch (error) {
    next(error)
  }
},


    logins: async (req, res,next) => {
        res.render('logins', {
            logoPath: '/frontend/imgs/logos/cyclonelogo.png'
        });
    },

    loginspost: async (req, res,next) => {
        // console.log(req.body);
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).send("User does not exist");
            }

            if (!user.isActive) {
                return res.status(400).json({ ok:true,error: "Please verify your email before logging in." })
            }

            if (!user.password) {
                return res.status(400).json({ok:true,error:"This account was registered using social login. Please use the social login option."})
            }

            const isMatch = await bcrypt.compare(password, user.password);
            console.log('password matching',isMatch);
            
            if (!isMatch) {
                return res.status(400).json({ok:true,error:'invalid credentials'})
            }

           
            const token = jwt.sign(
                { id: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '35d' } // Token expires in 7 days
            );
           
            
            res.cookie('token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 35 * 24 * 60 * 60 * 1000 // Corrected to 7 days (in milliseconds)
            });
            
                res.status(200).json({ok:true,message:'User is authenticated'});
            // res.redirect('/home');
        } catch (error) {
            console.error("Login error:", error);
            next(error)
        }
    },

    signup: async (req, res,next) => {
        res.render('signup', {
            logoPath: '/frontend/imgs/logos/cyclonelogo.png'
        });
    },

    createUser: async (req, res,next) => {
        try {
         console.log('req.body',req.body)
          const { fullname, email, phone, password, confirm_password,refferalCode } = req.body;
      
          if (/\d/.test(fullname)) {
            return res.status(400).json({ success: false, message: 'Fullname cannot contain numbers' });
          }
          if (fullname === null || fullname.trim() === '') {
            return res.status(400).json({ success: false, message: 'name field is required' });
          }
          if (email === null || email.trim() === '') {
            return res.status(400).json({ success: false, message: 'email is required' });
          }
          if (phone === null || phone.trim() === '') {
            return res.status(400).json({ success: false, message: 'phone number is required' });
          }
          if (password === null || password.trim() === '') {
            return res.status(400).json({ success: false, message: 'password is required' });
          }
          if (confirm_password === null || confirm_password.trim() === '') {
            return res.status(400).json({ success: false, message: 'Confirm password is required' });
          }
          if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits and contain only numbers' });
          }
          if (password !== confirm_password) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
          }
          const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
          if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
              success: false, 
              message: 'Password must be at least 8 characters and include at least one letter, one number, and one special character.' 
            });
          }
      
          const userExist = await User.findOne({ email });
          if (userExist) {
            return res.status(400).json({ success: false, message: 'User already exists' });
          }

     //generate refferal code for new user
          const newRefferalCode = RefferalCode.generateReferralCode()

     console.log('referalcode',refferalCode)

          let refferer = null
          if(refferalCode){
            console.log('reached here');
            
            refferer = await User.findOne({ refferalCode })
            console.log('reached here2')
            if(!refferer){
              return res.status(400).json({success:false,message:'invalid refferal code'})
            }
          }
          console.log('refferer',refferer)
          console.log('newRefferalCode',newRefferalCode)


      
          const salt = await bcrypt.genSalt(5);
          const hashedPassword = await bcrypt.hash(password, salt);
          const otp = generateOTP();
          console.log(otp);
          const otpExpires = new Date(Date.now() + (1 * 60 * 1000));
      
          const newUser = new User({
            fullName: fullname,
            email,
            mobile: phone,
            password: hashedPassword,
            isVerified: false,
            otp,
            otpExpires,
            refferalCode:newRefferalCode,
            refferedBy:refferer?refferer._id:null
          });
      
          await newUser.save();
console.log('newUser',newUser)
//if there is a refferer create coupon for both user
if(refferer){
const newUserrefferal = new Coupon({
  user:newUser._id,
  couponCode:`WELCOME${newUser._id.toString().slice(-4)}`,
  offerPrice:250,
  minAmount:5000,
  startDate:new Date(),
  expireDate:new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  isBlocked:false,
  refferedBy:refferer._id

})
await newUserrefferal.save()
console.log('newUserrefferal',newUserrefferal)



const existUserCoupon=new Coupon({
  user:refferer._id,
  couponCode:`REFERRAL${refferer._id.toString().slice(-4)}`,
  offerPrice:350,
  minAmount:5000,
  startDate:new Date(),
  expireDate:new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  isBlocked:false

})


await existUserCoupon.save()

console.log('existUserCoupon',existUserCoupon)


await refferer.save()


console.log('refferer',refferer)
}




      
          await sendEmail(email, 'Your OTP for Account Verification', 
            `<p>Your OTP is: <strong>${otp}</strong></p><p>It will expire in 1 minute.</p>`
          );
        
console.log('refferalCode:newRefferalCode',newRefferalCode)
      
          res.status(201).json({ success: true, message: 'Signup successful. OTP sent to email.' ,refferalCode:newRefferalCode,});
      
        } catch (error) {
          console.error('Error during signup:', error);
          next(error)
        }
      },
      

verifyOTP: async (req, res,next) => {
        try {
       
            
const {email, otp }=req.body
const user =await User.findOne({email})
console.log(email,otp+'this is rq');

if(!user){
    return res.status(400).json({message:"User not found"})
}
if (user.isVerified) {
    return res.status(400).json({ message: 'User is already verified.' });
}


if (!user.otp) {
    return res.status(400).json({ message: 'No OTP found. Please request a new OTP.' });
}

if(user.otp!==otp){
return res.status(400).json({message:'Invalid otp'})
}

if(String(user.otp)!==String(otp)){
    console.log(user.otp,otp)
    return res.status(400).json({message:'invalid opt'})
}
if(user.otpExpires&&new Date(user.otpExpires)<new Date()){
    return res.status(400).json({message:'OTP expired'})
}
user.isVerified = true
user.otp = null
user.otpExpires = null
await user.save()
res.status(200).json({message:'OTP verified successfully'})

        } catch (error) {
            console.log('Error verifying OTP',error)
            next(error)
        }
    },

    resendOTP: async (req, res,next) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            const otp = generateOTP();
            user.otp = otp;
            const otpExpires = new Date(Date.now() + (1 * 60 * 1000) );


            user.otpExpires=otpExpires
            await user.save();

            await sendEmail(email, 'Your new OTP for Account Verification', 
                `<p>Your new OTP is: <strong>${otp}</strong></p><p>It will expire in 30 seconds.</p>`
            );

            res.status(200).json({ message: 'New OTP sent to email' });
        } catch (error) {
            console.error('Error resending OTP:', error);
            next(error)
        }
    },


};

module.exports = authController;
