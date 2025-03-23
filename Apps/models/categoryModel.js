const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true ,unique:true},
    description: { type: String, required: true },
    isBlocked: { type: Boolean, default: false },
    slug: { type: String, required: true ,unique:true},
    image: { type: String },
    offer: { type: Number, default: 0 }, 
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  });
  module.exports = mongoose.model('Category', CategorySchema)
  