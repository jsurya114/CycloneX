const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    description: { type: String, required: true }, // Brand description
    image: { type: String, }, 
    isBlocked: { type: Boolean, default: false } 
},{timestamps:true});

module.exports = mongoose.model('Brand', BrandSchema); 