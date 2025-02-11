const Admin = require('../../models/adminModel');
const bcrypt = require('bcryptjs');

const adminAuth={
login: async (req, res) => {
    res.render('login', {
        pageTitle: 'Admin Login - Cyclone',
        brandName: 'CYCLONE',
        slogan: 'RIDE BEYOND LIMITS',
        loginAction: '/admin/login',
        rightImage: '/images/bicycle-illustration.png',
        logoPath: '/backend/imgs/logos/cyclonelogo.png'
    });
},

loginPost: async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;

    try {
        // Find the admin by email
        const admin = await Admin.findOne({ email });

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
}
}
module.exports = adminAuth