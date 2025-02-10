const mongoose= require('mongoose')
const ReviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
    rating: { type: Number, required: true },
    description: { type: String },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 }
  });
  module.exports=ReviewSchema