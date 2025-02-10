const mongoose = require('mongoose')
const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
        quantity: { type: Number, required: true },
        subTotal: { type: Number, required: true }
      }
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    orderStatus: { type: String, required: true },
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    timestamp: { type: Date, default: Date.now }
  });
  module.exports= OrderSchema
  