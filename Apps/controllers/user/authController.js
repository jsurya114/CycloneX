require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../../models/userModel');

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

// Configure Nodemailer with correct SMTP settings
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // Use 587 if 465 doesn't work
    secure: true,
    auth: {
        user: process.env.EMAIL, 
        pass: process.env.EMAIL_PASSWORD 
    }
});



// Function to send email
const sendEmail = async (to, subject, htmlContent) => {
    try {
        let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject,
            html: htmlContent
        });
        console.log("✅ Email sent successfully:", info.response);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};

const authController = {
    logins: async (req, res) => {
        res.render('logins', {
            logoPath: '/frontend/imgs/logos/cyclonelogo.png'
        });
    },

    loginspost: async (req, res) => {
        console.log(req.body);
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).send("User does not exist");
            }

            if (!user.isVerified) {
                return res.status(400).send("Please verify your email before logging in.");
            }

            if (!user.password) {
                return res.status(400).send("This account was registered using social login. Please use the social login option.");
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).send("Invalid credentials");
            }

           
            const token = jwt.sign(
                { id: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '7d' } // Token expires in 7 days
            );
            console.log('Generated Token:', token);
            
            res.cookie('token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 7 * 24 * 60 * 60 * 1000 // Corrected to 7 days (in milliseconds)
            });
            

            res.redirect('/home');
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).send("Internal Server Error");
        }
    },

    signup: async (req, res) => {
        res.render('signup', {
            logoPath: '/frontend/imgs/logos/cyclonelogo.png'
        });
    },

    createUser: async (req, res) => {
        try {
          console.log('Request Body:', req.body);
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
            otpExpires
          });
      
          await newUser.save();
      
          await sendEmail(email, 'Your OTP for Account Verification', 
            `<p>Your OTP is: <strong>${otp}</strong></p><p>It will expire in 1 minute.</p>`
          );
      
          res.status(200).json({ success: true, message: 'Signup successful. OTP sent to email.' });
      
        } catch (error) {
          console.error('Error during signup:', error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      },
      

verifyOTP: async (req, res) => {
        try {
            console.log("verrrr");
            
const {email, otp }=req.body
const user =await User.findOne({email})
console.log(email,otp+'this is rq');

if(!user){
    return res.status(400).json({message:"User not found"})
}
if (user.isVerified) {
    return res.status(400).json({ message: 'User is already verified.' });
}
console.log('verified');

if (!user.otp) {
    return res.status(400).json({ message: 'No OTP found. Please request a new OTP.' });
}
console.log('verified1');
if(user.otp!==otp){
return res.status(400).json({message:'Invalid otp'})
}
console.log('verified2');
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
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    resendOTP: async (req, res) => {
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
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },


};

module.exports = authController;
