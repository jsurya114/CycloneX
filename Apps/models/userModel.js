const mongoose = require("mongoose");
const { type } = require("os");

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function () { return !this.googleId; } },
    mobile: { type: String, required: function () { return !this.googleId; } },
    profileImage: { type: String },
    status:{type:String},
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    otp: { type: String }, // Add this field for storing OTP
    otpExpires: { type: Date }, // Add this field for storing OTP expiry time
    googleId: { type: String },
    facebookId: { type: String }

});

module.exports = mongoose.model("User", UserSchema);