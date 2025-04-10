const User = require('../../models/userModel')
const Product = require('../../models/productModel')
const jwt =require('jsonwebtoken')
const Order=require('../../models/orderModel')
const Review=require('../../models/reviewModel')

const reviewController ={
    loadReview:async (req,res,next) => {
        try {
             const token =req.cookies.token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                  const userId = decoded.id;
            const user = await User.findById(userId)
            if(!user){
                return res.status(400).json({success:false,message:'Unauthorized'})
            
            }
const {orderId,id}=req.params
const order= await Order.findOne({orderId}).populate('items.product')
if(!order){
    return res.status(404).json({success:false,message:'Order not found'})


}
const orderItem = order.items.find(item => item.product._id.toString() === id.toString());

            if (!orderItem) {
                return res.status(404).json({ success: false, message: 'Product not found in the order' });
            }

const reviews = await Review.find({product:id}).populate('user','name').sort({createdAt:-1})

            return res.status(200).render('review',{order,product: orderItem.product,user,reviews})
        } catch (error) {
            next(error)
        }
    },
submitReview:async (req,res,next) => {
    try {
        const {id,orderId}=req.params
        const {user,rating,description}=req.body
        
        if ( !rating || !description) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        } 
if(!id){
    return res.status(400).json({success:false,message:'productId is missing'})
}

        

        const newReview = new Review({
            user,
            product:id,
            rating,
            description,
            orderId
        })
await newReview.save()

return res.status(201).json({ success: true, message: "Review submitted successfully!" })

    } catch (error) {
       next(error) 
    }
}





}
module.exports= reviewController