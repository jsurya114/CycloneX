
const Brand = require('../../models/brandModel')
const Coupon = require('../../models/couponModel')
const { category } = require('./categoryController')
const couponController={
 getCoupon:async (req,res,next) => {
    try{ 

        const coupons = await Coupon.find()
        if(!coupons){
            return res.status(404).json({success:false,message:'coupon not found'})
        }
        return res.status(200).render('coupons',{coupons})
    }
 catch(error){
next(error)
 }
},
addCoupon:async (req,res,next) => {
   try {
    console.log('body',req.body)
const {couponCode,startDate,expireDate,offerPrice,minAmount}=req.body
console.log('couponCode,startDate,expireDate,offerPrice,minAmount',couponCode,startDate,expireDate,offerPrice,minAmount)
if(!couponCode||!startDate||!expireDate||!offerPrice||!minAmount){
    return res.status(400).json({ success: false, field:'all', message: "All fields are required."  });

}
const existingCoupon = await Coupon.findOne({
    couponCode: { $regex: new RegExp(`^${couponCode}$`, 'i') }
  });
if(existingCoupon){
    return res.status(400).json({ success: false, message: 'Coupon already exists' });

}
const newCoupon = new Coupon({
    couponCode,
    startDate,
    expireDate,
    offerPrice,
    minAmount
})
await newCoupon.save()
res.status(200).json({ success: true, message: 'Coupon added successfully' });


   } catch (error) {
    console.error("Error adding coupon:", error);
    next(error)
   } 
},
couponBlocking:async (req,res,next) => {
   try {
    const couponId = req.params.couponId

    const coupon = await Coupon.findById(couponId)
    if(!coupon){
        return res.status(404).json({success:false,message:'coupon not found'})
    }
    console.log('coupon activated2',coupon)
    coupon.isBlocked=req.body.isBlocked
    await coupon.save()
    console.log('coupon activated1',coupon)
    res.status(200).json({success:true,message:`Coupon ${coupon.couponCode} is now ${coupon.isBlocked ? 'deactivated':'activated'} successfully`})
}catch(error){
    next(error)
}


},
showEditCoupon:async (req,res,next) => {
    try {
        const couponId =req.params.couponId
        const coupon = await Coupon.findById(couponId)
        if(!coupon){
            return res.status(404).json({success:false,message:'coupon not found'})
        }
        return res.status(200).render('editcoupon',{coupon})
    } catch (error) {
        next(error)
    }
},
editCoupon:async (req,res,next) => {
    try {
        const couponId = req.params.couponId
        console.log('assf',couponId)
       
        const {couponCode,startDate,expireDate,offerPrice,minAmount}=req.body
  
        console.log('couponCode,startDate,expireDate,offerPrice,minAmount',couponCode,startDate,expireDate,offerPrice,minAmount)
        if(!couponCode||!startDate||!expireDate||!offerPrice||!minAmount){
            return res.status(400).json({ success: false, field:'all', message: "All fields are required."  });
        
        }
        const existingCoupon = await Coupon.findOne({
            couponCode: { $regex: new RegExp(`^${couponCode}$`, 'i') }
          });
          if (existingCoupon && existingCoupon._id.toString() !== couponId) {
            return res.status(400).json({ success: false, message: 'Coupon already exists' });
          }
await Coupon.findByIdAndUpdate(couponId,{couponCode,startDate,expireDate,offerPrice,minAmount})
res.status(200).json({success:true,message:'coupon updated successfully'})


    } catch (error) {
        next(error)
    }
}

}
module.exports=couponController