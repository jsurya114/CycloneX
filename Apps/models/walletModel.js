const mongoose=require('mongoose')
const WalletSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, required: true },
    transactionId: { type: String, required: true },
    transactionType: { type: String, required: true },
    date: { type: Date, default: Date.now },
    withdrawal: { type: Number },
    deposit: { type: Number },
    description: { type: String }
  });
module.exports=WalletSchema  