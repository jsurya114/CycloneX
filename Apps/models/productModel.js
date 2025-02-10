const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    brands: { type: mongoose.Schema.Types.ObjectId, ref: 'Brands', required: true },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
  });
  module.exports=ProductSchema
  