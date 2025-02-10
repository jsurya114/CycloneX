const mongoose =require('mongoose')
const OfferSchema = new mongoose.Schema({
    offerType: { type: String, required: true },
    offerPercentage: { type: Number },
    offerPrice: { type: Number }
  });

  module.exports=OfferSchema
  