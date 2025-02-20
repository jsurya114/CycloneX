const jwt = require('jsonwebtoken')
const Admin = require('../models/adminModel')
const ensureAuth=async (req,res,next) => {
    try {
        const token =req.cookies.token
        if(!token){//not logged in
            return next();
        }
        //verify token
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
const admin = await Admin.findById(decodedToken.id)
if(!admin){
    return next()
}   
req.admin = admin
console.log(req.path);

if(req.path==='/login'){
    console.log('invoked condition');
    return res.status(400).redirect('/admin/dashboard')
}
next()
    } catch (error) {
        console.error('ensureAuth error:', error);
    return res.redirect('/admin/login');
    }
}
module.exports=ensureAuth