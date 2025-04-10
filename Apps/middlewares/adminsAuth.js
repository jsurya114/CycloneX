const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).redirect('/admin/login');
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
           
                res.clearCookie('token');
                return res.redirect('/admin/login');
            }
            throw error;
        }

        const admin = await Admin.findById(decodedToken.id);
        if (!admin) {
            res.clearCookie('token');
            return res.status(404).redirect('/admin/login');
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error('verifyAdmin error:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = verifyAdmin;