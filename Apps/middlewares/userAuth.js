const jwt = require('jsonwebtoken')

const User=require('../models/userModel')
const verifyUser = async (req, res, next) => {
    console.log('invoked verify user');
    
    try {
      // Check for JWT token
      const token = req.cookies.token;
      if (token) {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;
        const isExistingUser = await User.findById(userId);
        if (isExistingUser) {
          req.user = isExistingUser; // Attach user to request
          return next();
        }
      }
  
      // Check for Passport session
      if (req.isAuthenticated()) {
        return next();
      }
  
      // If neither is present, redirect to login
      return res.status(401).redirect('/');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
module.exports=verifyUser