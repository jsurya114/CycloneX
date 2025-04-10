const mongoose = require('mongoose');
const { type } = require('os');

const AdminWalletSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  balance: { type: Number, required: true, default: 0 },

  transactionStatus: { type: Number, default: 0 },
  description: { type: String },
  transaction: [{ 
  
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    amount: { type: Number, required: true },
    transactionType: { type: String, enum: ['debit', 'credit'], required: true },
    date: { type: Date, default: Date.now },
    reason: { type: String },
    transactionId:{type:String},
    
    user:{type: mongoose.Schema.Types.ObjectId,ref:'User'}
  }],
});

module.exports = mongoose.model('AdminWallet', AdminWalletSchema); 
