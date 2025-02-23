require('dotenv').config()
const Admin = require('../../models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

// Ensure JWT secret is available
if (!process.env.JWT_SECRET) {
    console.error("❌ JWT secret is missing. Please add JWT_SECRET to your .env file!");
    process.exit(1);
}
const adminAuth={
login: async (req, res) => {
    res.render('login', {
        pageTitle: 'Admin Login - Cyclone',
        brandName: 'CYCLONE',
        slogan: 'RIDE BEYOND LIMITS',
        loginAction: '/admin/login',
        rightImage: '/images/bicycle-illustration.png',
        logoPath: '/backend/imgs/logos/cyclonelogo.png', 
        error:null
    });
},

loginPost: async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    
    try {
        // Find the admin by email
        const admin = await Admin.findOne({ email ,isAdmin:true});

        if (!admin) {
            return res.status(401).render('login', {
                pageTitle: 'Admin Login - Cyclone',
                brandName: 'CYCLONE',
                slogan: 'RIDE BEYOND LIMITS',
                loginAction: '/admin/login',
                rightImage: '/images/bicycle-illustration.png',
                logoPath: '/backend/imgs/logos/cyclonelogo.png',
                error: 'Invalid email or password'
            });
        }

        // Compare the entered password with the hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {


            return res.status(401).render('login', {
                pageTitle: 'Admin Login - Cyclone',
                brandName: 'CYCLONE',
                slogan: 'RIDE BEYOND LIMITS',
                loginAction: '/admin/login',
                rightImage: '/images/bicycle-illustration.png',
                logoPath: '/backend/imgs/logos/cyclonelogo.png',
                error: 'Invalid email or password'
            });
        }
        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Token expires in 7 days
        );
        console.log('Generated Token:', token);
        
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 7 * 60 * 60 * 1000 // Corrected to 7 days (in milliseconds)
        });
        

        // If credentials are valid, redirect to the dashboard
        res.status(200).redirect('/admin/dashboard');

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).render('login', {
            pageTitle: 'Admin Login - Cyclone',
            brandName: 'CYCLONE',
            slogan: 'RIDE BEYOND LIMITS',
            loginAction: '/admin/login',
            rightImage: '/images/bicycle-illustration.png',
            logoPath: '/backend/imgs/logos/cyclonelogo.png',
            error: 'An error occurred during login'
        });
    }
},
logout:(req,res)=>{
    res.clearCookie('token')
    res.status(200).redirect('/admin/login')
}
}
module.exports = adminAuth