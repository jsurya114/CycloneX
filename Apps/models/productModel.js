const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true ,unique:true},
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  images: [{ type: String }],             // Additional (cropped) images
  mainImage: { type: String, required: true }, // Main image (no cropping)
  brands: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  offer: { type: Number, default: 0 }, 
  updatedAt: { type: Date },
},{timestamps:true});

module.exports = mongoose.model('Product', ProductSchema);
