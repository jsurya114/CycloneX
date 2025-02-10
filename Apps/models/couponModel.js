
const mongoose = require('mongoose')
const CouponSchema = new mongoose.Schema({
    couponCode: { type: String, required: true },
    couponType: { type: String, required: true },
    discount: { type: Number, required: true },
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    usageLimit: { type: Number, required: true },
    expireDate: { type: Date, required: true },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    brands: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brands' }]
  });
  module.exports=CouponSchema
  