require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../../models/userModel');
const nodemailer = require('nodemailer');

// Check if email credentials exist
if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    console.error("❌ Email credentials are missing. Check your .env file!");
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

// Generate a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

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

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).send("Invalid credentials");
            }

            req.session.user = user;
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

            if (!password || !confirm_password) {
                return res.status(400).json({ message: 'Password fields are required' });
            }
            if (password !== confirm_password) {
                return res.status(400).json({ message: 'Passwords do not match' });
            }

            const userExist = await User.findOne({ email });
            if (userExist) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const salt = await bcrypt.genSalt(5);
            const hashedPassword = await bcrypt.hash(password, salt);

            const otp = generateOTP();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

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

            // Send OTP Email
            await sendEmail(email, 'Your OTP for Account Verification', 
                `<p>Your OTP is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`
            );

            res.status(200).json({ message: 'Signup successful. OTP sent to email.' });

        } catch (error) {
            console.error('Error during signup:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    resendOtp: async (req, res) => {
        try {
            const { email } = req.body;
console.log(email)
            const user = await User.findOne({ email });
            if (!user) {
                console.log('user not found')
                return res.status(400).json({ message: 'User not found' });
            }

            const newOtp = generateOTP();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            console.log(newOtp)
            console.log(otpExpires)
       // Update the user's OTP and expiry time in the database
            await User.findOneAndUpdate({ email }, { otp: newOtp, otpExpires });

            // Send the new OTP via email
            await sendEmail(email, 'Resend OTP for Account Verification', 
                `<p>Your new OTP is: <strong>${newOtp}</strong></p><p>It will expire in 10 minutes.</p>`
            );
console.log('success')
            res.status(200).json({ message: 'New OTP sent successfully' });

        } catch (error) {
            console.error('Error resending OTP:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    verifyOtp: async (req, res) => {
        try {
           
            const { email, otp } = req.body;
            console.log(otp)
            console.log(email)
          
            const enteredOtp = otp.trim();
 console.log(enteredOtp)
           
            const user = await User.findOne({ email });
            console.log(user)

            if (!user) {
                console.log('user not found')
                return res.status(400).json({ message: 'User not found' });
            }
    
console.log(user.otp)
console.log(user.otpExpires)


            // Check if OTP exists and is not expired
            if (!user.otp || user.otpExpires < new Date()) {
                console.log('invalid or exipred otp')
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }
    
            // Convert stored OTP and entered OTP to string before comparing
            if (user.otp.toString() !== enteredOtp) {
                console.log('mismatch')
                return res.status(400).json({ message: 'Invalid OTP' });
            }
    
            // If OTP is valid, mark user as verified
            await User.findOneAndUpdate(
                { email },
                { isVerified: true, otp: null, otpExpires: null }
            );
    console.log('verified')
            res.status(200).json({ message: 'OTP verified successfully' });
    
        } catch (error) {
            console.error('Error verifying OTP:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    

    home: async (req, res) => {
        res.render('home', {
            logoPath: '/frontend/imgs/logos/cyclonelogo.png'
        });
    }
};

module.exports = authController;
