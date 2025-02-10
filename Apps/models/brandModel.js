const mongoose=require('mongoose')
const BrandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    isBlocked: { type: Boolean, default: false }
  });
  module.exports=BrandSchema