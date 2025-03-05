const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const userEnsure = async (req, res, next) => {
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
               
                res.clearCookie('token');
                return res.redirect('/');
            }
            throw error;
        }
        if(decodedToken?.resetPassword){
            return next();
        }

        const user = await User.findById(decodedToken.id);
        if (!user) {
            return next(); // No user found, proceed without authentication
        }

        req.user = user;

        // Redirect authenticated user from root or signup to home
        if (req.path === '/' || req.path === '/signup'|| req.path==='/resetpassword' || req.path==='/forgotpassword'|| req.path.includes('admin')) {
            return res.redirect('/home');
        }

        next();
    } catch (error) {
        console.error('userEnsure error:', error);
        return res.redirect('/');
    }
};

module.exports = userEnsure;