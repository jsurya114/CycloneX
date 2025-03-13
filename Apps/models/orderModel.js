const mongoose = require('mongoose');
const { type } = require('os');
const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        subTotal: { type: Number, required: true }
      }
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    orderStatus: { type: String, enum: ["pending", "processing", "shipped","delivered", "cancelled","return request","returned",], default: "pending" },
    cancelReason:{type:String,},
    returnReason:{type:String,},
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    timestamp: { type: Date, default: Date.now }
  });
  module.exports= mongoose.model('Order',OrderSchema)
  