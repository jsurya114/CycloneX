const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, min: 1 },
            salePrice: { type: Number, default: 0 }, // Store sale price
            subtotal: { type: Number, default: 0 }   // Store subtotal for each item
        }
    ],
    totalSubtotal: { type: Number, default: 0 } // Store total cart subtotal
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);

