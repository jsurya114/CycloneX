const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel')
const verifyAdmin = async (req,res,next) => {
    try {
       const token = req.cookies.token
       if(!token){
        console.log('token missing ')
       return res.status(401).redirect('/admin/login')
       } 

const decodedToken = jwt.verify(token,process.env.JWT_SECRET)

if(!decodedToken){
    console.log('invalid token ')
    return res.status(403).redirect('/admin/login')
}
const adminId = decodedToken.id 
const isAdmin = await Admin.findById(adminId)
if(!isAdmin){
    console.log('verify admin')
   return  res.status(404).redirect('/admin/login')
}

req,admin=isAdmin
next()

    } catch (error) {
        console.error(error)
        res.status(500).send('internal server error')
    }
}

module.exports = verifyAdmin