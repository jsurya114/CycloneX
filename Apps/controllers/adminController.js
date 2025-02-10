const Admin = require('../models/adminModel');
const bcrypt = require('bcryptjs');

const adminController = {
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
            res.redirect('/admin/dashboard');

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

    dashboard: async (req, res) => {
        res.render('dashboard');
    },
    category:async (req,res)=>{
      res.render('category')
    },
    product: async (req,res)=>{
        res.render('product-list')
    },
    product2: async (req,res)=>{
        res.render('product-list2')
    },
   addproduct: async (req,res)=>{
        res.render('addproduct')
    },
   brands: async (req,res)=>{
        res.render('brands')
    },
   

    adduser: async (req, res) => {
        res.send('This is the add user page');
    },

    deleteuser: async (req, res) => {
        res.send('This is the delete user page');
    },

  
};

module.exports = adminController;
