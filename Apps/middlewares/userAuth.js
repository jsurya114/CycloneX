const jwt = require('jsonwebtoken')

const User=require('../models/userModel')
const verifyUser = async (req, res, next) => {
   
    
    try {
      // Check for JWT token
      const token = req.cookies.token;
      
     if(!token){
    
      return res.status(401).redirect('/')
     }
     const decodedToken=jwt.verify(token,process.env.JWT_SECRET)

if(!decodedToken){
  
  return res.status(403).redirect('/')
}
const userId = decodedToken.id 

const isUser = await User.findById(userId)

if(!isUser){
 
  return res.status(404).redirect('/')
}
if(isUser.isActive===false){
  res.clearCookie('token')
 return res.status(200).redirect('/');
}

req.user=isUser

next()

    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
module.exports=verifyUser