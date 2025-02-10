const mongoose=require('mongoose')
const BannerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    images: [{ type: String, required: true }],
    startingDate: { type: Date, required: true },
    endingDate: { type: Date, required: true }
  });
module.exports=BannerSchema  