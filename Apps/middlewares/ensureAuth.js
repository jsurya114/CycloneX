const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

const ensureAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return next(); // No token, proceed without authentication
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
              
                res.clearCookie('token'); // Clear expired token
                return res.redirect('/admin/login'); // Redirect to admin login
            }
            throw error; // Propagate other errors
        }

        const admin = await Admin.findById(decodedToken.id);
        if (!admin) {
            res.clearCookie('token'); // Clear invalid token
            return res.redirect('/admin/login');
        }

        req.admin = admin; // Attach admin to request object

        // Redirect authenticated admin from login to dashboard
        if (req.path === '/admin/login'||req.path==='/admin/product'||req.path==='/admin/addproduct'||req.path==='/admin/brands'||req.path==='/admin/editbrands'||req.path==='/admin/editcategory'||req.path==='/admin/categry'||
            req.path==='/admin/userlist'||req.path==='/admin/userdetails'||req.path==='/admin/product-list2'||req.path==='/admin/editproduct'||req.path.includes('/')) {
            return res.redirect('/admin/dashboard');
        }

        next();
    } catch (error) {
        console.error('ensureAuth error:', error);
        res.clearCookie('token');
        return res.redirect('/admin/login');
    }
};

module.exports = ensureAuth;