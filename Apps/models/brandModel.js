const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    description: { type: String, required: true }, // Brand description
    image: { type: String, }, 
    isBlocked: { type: Boolean, default: false } ,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },

});

module.exports = mongoose.model('Brand', BrandSchema); 