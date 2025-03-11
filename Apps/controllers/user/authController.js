require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../../models/userModel');
const sendEmail=require('../../services/email')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const generateOTP = require('../../services/otp');


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
         
          const { fullname, email, phone, password, confirm_password } = req.body;
      
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
      
          const salt = await bcrypt.genSalt(5);
          const hashedPassword = await bcrypt.hash(password, salt);
          const otp = 
          
          
          
          
          
          
          
          generateOTP();
          console.log(otp);
          const otpExpires = new Date(Date.now() + (1 * 60 * 1000));
      
          const newUser = new User({
            fullName: fullname,
            email,
            mobile: phone,
            password: hashedPassword,
            isVerified: false,
            otp,
            otpExpires
          });
      
          await newUser.save();
      
          await sendEmail(email, 'Your OTP for Account Verification', 
            `<p>Your OTP is: <strong>${otp}</strong></p><p>It will expire in 1 minute.</p>`
          );
        

      
          res.status(201).json({ success: true, message: 'Signup successful. OTP sent to email.' });
      
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
