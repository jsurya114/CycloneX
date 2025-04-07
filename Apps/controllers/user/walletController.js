const Wallet= require('../../models/walletModel')
const jwt = require('jsonwebtoken')
const User=require('../../models/userModel')
const Order = require('../../models/orderModel')
const Cart = require('../../models/cartModel')
const { timeStamp } = require('console')
const walletController={
getWallet:async (req,res,next) => {
    try {
        const token =req.cookies.token
    
           const decoded = jwt.verify(token, process.env.JWT_SECRET);
             const userId = decoded.id;
             console.log('here2',userId)
       const user = await User.findById(userId)
      
       if(!user){
           return res.status(400).json({success:false,message:'Unauthorized'})
       
       }
       let cartCount =await Cart.countDocuments({user:userId})
    
       let wallet = await Wallet.findOne({user:userId}).populate('transaction.orderId').sort({timestamp:-1})
       if(!wallet){
        wallet = new Wallet({
            user:userId,
            balance:0,
            transaction:[]

        })
        await wallet.save()
       }
        
return res.status(200).render('wallet',{user,wallet,cartCount})

    } catch (error) {
        next(error)
    }
},
returnWallet:async (req,res,next) => {
    try {
        
        const token =req.cookies.token
     
           const decoded = jwt.verify(token, process.env.JWT_SECRET);
             const userId = decoded.id;
             console.log('here23',userId)
       const user = await User.findById(userId)
       
       if(!user){
           return res.status(400).json({success:false,message:'Unauthorized'})
       
       }
      
       const {orderId}=req.params
       const {returnReason,returnDetails,returnItems}=req.body

console.log('kjlk',returnItems)


       const order = await Order.findById(orderId).populate('items.product')
       console.log('jsljfsdlkjf',order)
if(!order){
    return res.status(404).json({success:false,message:'order not foound'})
}

if(order.orderStatus!=='delivered'){
    return res.status(400).json({success:false,message:'Only delivered orders can be returned'})
}

order.returnReason=returnReason
await order.save()
let wallet = await Wallet.findOne({user:userId})
if(!wallet){
    wallet = new Wallet({
        user:userId,
        balance:0,
        transaction:[]

    })
    await wallet.save()
   }

   let refundAmount =0
   order.items.forEach((item)=>{
    if(returnItems.includes(item.product._id.toString())){
        refundAmount+=item.subTotal
    }
   })


console.log('sdfs',order)



    } catch (error) {
       next(error) 
    }
}
}
module.exports=walletController