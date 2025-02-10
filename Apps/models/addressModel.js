
const mongoose = require('mongoose')
const AddressSchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: Number, required: true },
    addressType: { type: String, required: true },
    landmark: { type: String },
    mobileNum: { type: String, required: true },
    email: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  });
  module.exports=AddressSchema
  