const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  couponCode: { 
    type: String, 
    required: true 
  },


  offerPrice: { 
    type: Number, 
    required: true 
  },
  minAmount: { 
    type: Number, 
    required: true 
  },
  startDate: { 
    type: Date, 
    default: Date.now,
    required: true 
  },
  expireDate: { 
    type: Date, 
    required: true 
  }, 
  isBlocked: {
    type: Boolean,
    default: false
  },
  user: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  brands: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Brands' 
  }]
});

module.exports = mongoose.model('Coupon', CouponSchema);