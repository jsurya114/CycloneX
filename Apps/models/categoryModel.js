const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    isBlocked: { type: Boolean, default: false }
  });
module.exports=CategorySchema