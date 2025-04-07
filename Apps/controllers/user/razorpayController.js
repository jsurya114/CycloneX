const Razorpay = require('razorpay');
require('dotenv').config();
const Admin = require('../../models/adminModel')
const Order = require('../../models/orderModel');
const Wallet = require('../../models/walletModel');
const User = require('../../models/userModel');
const Cart = require('../../models/cartModel');
const jwt = require('jsonwebtoken'); // ✅ Import JWT
const crypto = require('crypto');
const { order } = require('./orderController');
const Address =require('../../models/addressModel')
const AdminWallet = require('../../models/adminWalletModel')
const generateTransactionId=require('../../services/transactionids')
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("❌ Razorpay credentials missing! Check your .env file.");
    process.exit(1); // Stop the app if credentials are missing
}

const RazorpayController={
    
    createRazorpay: async (req, res, next) => {
        try {
            console.log("🔥 Creating Razorpay Order",req.body);
    
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ success: false, message: "User not authenticated" });
            }
    
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;
    
            const { totalAmount, items, address, paymentMethod } = req.body;
    
            if (!totalAmount || totalAmount <= 0) {
                return res.status(400).json({ success: false, message: "Invalid order amount" });
            }
    
            const options = {
                amount: totalAmount * 100,  // Convert to paise
                currency: "INR",
                receipt: "order_" + new Date().getTime(),
                payment_capture: 1,
            };
    
            const razorpayOrder = await razorpay.orders.create(options);
            console.log("✅ Razorpay order created:", razorpayOrder);
    
            const newOrder = new Order({
                orderId: razorpayOrder.id,  // ✅ Now correctly using `order.id`
                user: userId,
                items,
                totalAmount,
                paymentMethod: "Razorpay",
                paymentStatus: 'pending',
                orderStatus: "pending",
                address
            });
            await newOrder.save()
            console.log("new order is here : ",newOrder)
            console.log('razorpayorer',razorpayOrder)
    
            return res.status(200).json({ success: true, order: razorpayOrder });
    
        } catch (error) {
            console.error("❌ Razorpay order creation failed:", error);
            next(error);
        }
    }
    
,    
verifyRazorPayment: async (req, res, next) => {
    try {

        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const user=await User.findById(userId)
        console.log('herer',req.body)
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid Razorpay response" });
        }


        // ✅ Generate Hash for Signature Verification
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        // ✅ Validate Payment Signature
        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        // ✅ Update Order Status
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId },
            {
                paymentMethod: "Razorpay",  // ✅ Ensure paymentMethod is updated
                paymentStatus: "paid",
                orderStatus: "processing"
            },
            { new: true }
        );

console.log('orderIII',updatedOrder)
        
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
            console.log('✅ Payment verified:', updatedOrder);


            let admin = await Admin.findOne(); // Assuming only one admin exists
            console.log('admin',admin);
            
            let adminWallet = await AdminWallet.findOne();
            console.log('admin',adminWallet);
            
            if (!adminWallet) {
                adminWallet = new AdminWallet({
                    admin: admin._id,
                    balance: 0,
                    transaction: [],
                });
                await adminWallet.save();
            }
            const transactionId=generateTransactionId.generateTransactionId()
            // Use updatedOrder.totalAmount instead of order.totalAmount
            adminWallet.transaction.push({
                transactionType: 'credit',
                amount: updatedOrder.totalAmount,
                reason: `credit for Order #${orderId}`,
                transactionId,
                user:userId
            });
            adminWallet.balance += updatedOrder.totalAmount; 
            
            await adminWallet.save();
            console.log('completed transac',adminWallet)

            await Cart.findOneAndUpdate({user:userId},{$set:{items:[]}})
        return res.json({ success: true, message: "Payment verified successfully" });

    } catch (error) {
        next(error)
        console.log( "Payment verification failed")
    }
},


failure:async (req,res,next) => {
const {orderId}=req.query
const order = await Order.findOne({orderId:orderId})

if(!order){
    return res.status(404).json({success:false,message:'no order found'})
}

    return res.status(200).render('failure',{order})

}




}
module.exports=RazorpayController
