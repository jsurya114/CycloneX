require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../../models/userModel');
const sendEmail =require('../../services/email')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const generateOTP = require('../../services/otp');




const passwordController ={
    showforgotpassword:async (req, res,next) => {
        res.render('forgotpassword')
    },
forgotpassword: async (req, res,next) => {
    console.log('invoked forgot pass');
    
    try {
        const { email } = req.body;

        // Validate email input
        if (!email) {
            return res.status(400).json({ success: false, message: 'Invalid request. Email is required.' });
        }

        // Find user in the database
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ success: false, message: 'Email not found' });
      }

        // Generate OTP
        const otp = generateOTP(); // Assume this function generates a 6-digit OTP
        const otpExpiry = Date.now() + 1 * 60 * 1000; // OTP expires in 1 minute
        console.log(otp);
        // Store OTP in the database with expiry time
        await User.findByIdAndUpdate(user._id, { otp, otpExpiry });

        console.log(otp)
        // Send OTP via email
        await sendEmail(email, 'Your OTP for Password Reset', 
            `<p>Your OTP is: <strong>${otp}</strong></p><p>It will expire in 1 minute.</p>`
        );

        // Generate JWT without OTP (only for user identification)
        const token = jwt.sign(
            { id: user._id, email: user.email, resetPassword:true }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } // Shorter expiry since it's for password reset
        );

        // Set JWT in cookies
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 1 * 60 * 24 * 1000 //  1h
        });

        return res.status(200).json({ success: true, message: 'OTP sent to email for password reset.' });

    } catch (error) {
        console.error('Error in forgotPassword:', error);
        next(error)
    }
},
verifyAndUpdatePassword: async (req, res, next) => {
  console.log('invkd vrf');
  
  try {
      const token = req.cookies.token;
      if (!token) {
          return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { otp } = req.body;

      // Fetch OTP from the database
      const user = await User.findById(decoded.id);
      if (!user || user.otp !== otp) {
          return res.status(400).json({ success: false, message: 'Invalid OTP, please check your OTP' });
      }

      // Clear OTP after successful verification
      await User.findByIdAndUpdate(user._id, { otp: null });


      
      return res.status(200).json({ success: true, message: 'OTP verification successful'});
  } catch (error) {
      console.error('Error during OTP verification:', error);
      next(error)
  }
},
resendOTP: async (req, res,next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
      }
  
      const otp = generateOTP(); // generate a 6-digit OTP
      user.otp = otp;
      // Set OTP expiry to 60 seconds (adjust to 30 seconds if desired)
      const otpExpires = new Date(Date.now() + 60 * 1000);
      user.otpExpires = otpExpires;
      await user.save();
  
      await sendEmail(
        email,
        'Your new OTP for Account Verification',
        `<p>Your new OTP is: <strong>${otp}</strong></p><p>It will expire in 60 seconds.</p>`
      );
  
      return res.status(200).json({ success: true, message: 'New OTP sent to email' });
    } catch (error) {
      console.error('Error resending OTP:', error);
      next(error)
    }
  },
  
  showresetpassword:async (req, res,next) => {
    res.status(200).render('resetpassword')
  },
  resetPassword: async (req, res,next) => {
    try {
      const { password, confirmpassword } = req.body;
      console.log('Request body:', req.body); // Debug: Check the incoming data
  
      // Validate input
      if (!password || !confirmpassword) {
        return res.status(400).json({ success: false, message: 'Password and confirm password are required' });
      }
      
      // Check if passwords match
      if (password !== confirmpassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10); // Use at least 10 rounds for better security
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Get user ID from token
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
  
      // Update user password
      await User.findByIdAndUpdate(userId, { password: hashedPassword });
  
      return res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
      console.error("Reset Password Error:", error);
      if (!res.headersSent) {
        next(error)
      }
    }
  }
  



}
module.exports=passwordController