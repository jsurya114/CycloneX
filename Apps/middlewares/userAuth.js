const jwt = require('jsonwebtoken')

const User=require('../models/userModel')
const verifyUser = async (req, res, next) => {
    console.log('invoked verify user');
    
    try {
      // Check for JWT token
      const token = req.cookies.token;
     if(!token){
      console.log('usertoken missing')
      return res.status(401).redirect('/')
     }
     const decodedToken=jwt.verify(token,process.env.jwt_SECRET)

if(!decodedToken){
  console.log('invalid user token')
  return res.status(403).redirect('/')
}
const userId = decodedToken.id 
const isUser = await User.findById(userId)
if(!isUser){
  console.log('verify user')
  return res.status(404).redirect('/')
}
req.user=isUser
next()

    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
module.exports=verifyUser