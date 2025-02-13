const jwt = require('jsonwebtoken')

const User=require('../models/userModel')

const verifyUser=async(req,res,next)=>{
    console.log('invoked vrify user');
    
    try{
        const token = req.cookies.token
        if(!token){
            console.log('verifyuser 1');
            return res.status(401).redirect('/')
            
        }
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
        if(!decodedToken){
            console.log('verifyuser 2');
           return res.status(403).redirect('/')
        }
        const userId =decodedToken.id
        const isExistingUser =await User.findById(userId);
        if(!isExistingUser){
            console.log('verifyuser 3');
           return res.status(404).redirect('/');
        }
        console.log('verifyuser 4');
        next()
    }catch(error){
        
        console.error(error)
        res.status(500).send('internal server error')
    }
  
}
module.exports=verifyUser