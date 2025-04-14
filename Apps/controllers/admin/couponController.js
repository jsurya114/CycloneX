
const Brand = require('../../models/brandModel')
const Coupon = require('../../models/couponModel')
const { category } = require('./categoryController')
const couponController={
 getCoupon:async (req,res,next) => {
    try{ 
        const { search, statusFilter } = req.query
        let filter = {}
        if (search) {
            filter.couponCode = { $regex: new RegExp(search, "i") };
        }
        if (statusFilter === "active") {
            filter.isBlocked = false;
        } else if (statusFilter === "deactive") {
            filter.isBlocked = true;
        }

        const coupons = await Coupon.find(filter)
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
const {couponCode,startDate,expireDate,offerPrice,minAmount}=req.body
if (!couponCode) {
    return res.status(400).json({ success: false, field: 'couponCode', message: "Coupon code is required." });
  }
  if (!startDate) {
    return res.status(400).json({ success: false, field: 'startDate', message: "Start date is required." });  
  }
  if (!expireDate) {
    return res.status(400).json({ success: false, field: 'expireDate', message: "Expiry date is required." });  
  }
  if (!offerPrice) {
    return res.status(400).json({ success: false, field: 'offerPrice', message: "Offer price is required." });  
  }
  if (!minAmount) {
    return res.status(400).json({ success: false, field: 'minAmount', message: "Minimum amount is required." });  
  }
const today = new Date().toISOString().split('T')[0]

if (startDate < today) {
    return res.status(400).json({ success: false, message: 'Start date cannot be in the past.' });
}
if (expireDate <= startDate) {
    return res.status(400).json({ success: false, message: 'Expiry date must be after the start date.' });
}
if(offerPrice>minAmount){
    return res.status(400).json({success:false,message:'offer price cannot be greater than minimum amount'})
}
if(offerPrice>=minAmount){
    return res.status(400).json({success:false,message:'offer price cannot be equal to the minimum amount'})
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
    coupon.isBlocked=req.body.isBlocked
    await coupon.save()
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
       
        const {couponCode,startDate,expireDate,offerPrice,minAmount}=req.body
  
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