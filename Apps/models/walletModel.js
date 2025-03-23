const mongoose=require('mongoose')
const WalletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, required: true, default: 0 },
  withdrawal: { type: Number, default: 0 },
  deposit: { type: Number, default: 0 },
  transactionStatus: { type: Number, default: 0 },
  description: { type: String },
  transaction: [{ 
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      amount: { type: Number, required: true },
      transactionType: { type: String, enum: ['debit', 'credit'], required: true },
      date: { type: Date, default: Date.now },
      reason: { type: String },
  }],

});
  module.exports = mongoose.model('Wallet', WalletSchema)