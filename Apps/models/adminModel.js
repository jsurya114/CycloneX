const mongoose = require('mongoose')
const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: true,  unique:true},               // Flag for admin
  });
  module.exports=mongoose.model('Admin',AdminSchema)