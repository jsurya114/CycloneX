const Address = require('../../models/addressModel')
const Product = require('../../models/productModel')
const Order = require('../../models/orderModel')

const User = require('../../models/userModel')
const Wallet = require('../../models/walletModel')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const orderController ={
 getorderlist:async (req,res,next) => {
try{

console.log('reacjed')


const { search, status, sort, page = 1, limit = 2 } = req.query;
 const filter = {};

 if (search) {
  const users = await User.find({
    $or: [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  }).select('_id')

  const userIds = users.map(user => user._id);
  filter.user = { $in: userIds }
}
if(status){
  filter.orderStatus=status
}
const sortOptions = {
  date_asc: { timestamp: 1 },
  date_desc: { timestamp: -1 },
  total_asc: { totalAmount: 1 },
  total_desc: { totalAmount: -1 }
};

const pageNum = parseInt(page) || 1;
const limitNum = parseInt(limit) || 2

  const order= await Order.find(filter).populate('address').populate('user').sort(sortOptions[sort] || { timestamp: -1 })
  .skip((pageNum - 1) * limitNum)
  .limit(limitNum)
  .limit(parseInt(limit))
  console.log('orderss',order)
console.log('reached3tyui')
const totalOrders = await Order.countDocuments(filter)

  const orderData = order.map(order => ({
   _id: order._id,
   fullName: order.user ? order.user.fullName  : "Guest",
   email: order.user ? order.user.email : "N/A",
   totalAmount: order.totalAmount,
   status: order.orderStatus,
   timestamp: order.timestamp
 }))
 console.log('orderdata',orderData)

 


    res.status(200).render('orderlist',{orders:orderData,currentPage: pageNum,
      totalPages: Math.ceil(totalOrders / limitNum)}) 

   }catch(error){
next(error)
   }
 },
 showOrderDetails:async (req,res,next) => {
try{

  const orderId = req.params.id
  console.log('order',orderId)
const order = await Order.findById(orderId).populate('address').populate('user').populate('items.product')
console.log(order.orderId)
const orderData = {
  orderId: order.orderId,
  fullName: order.user ? order.user.fullName : "Guest",
  email: order.user ? order.user.email : "N/A",
  phoneNumber: order.user ? order.user.phoneNumber : "N/A",
  totalAmount: order.totalAmount,
  status: order.orderStatus,
  paymentMethod: order.paymentMethod,
  items: order.items,
  shippingAddress: order.address,
  timestamp: order.timestamp,
  
}

  res.status(200).render('orderdetailss',{orders:orderData})
 }catch(error){
  next(error)
 }
},
updateOrderStatus:async (req,res,next) => {
  try {


    
    console.log('asdffs',req.body)
    const orderStatus =req.body.orderStatus
    const orderId = req.params.id
    console.log('this is orderid',orderId)
    
    console.log('fasdsd',orderStatus)
    const order = await Order.findOne({orderId})
    const user=order.user.toString()
    console.log('theis is user',user)
    console.log('this is order',order)
    if(!order){
      return res.status(404).send('order not found')
    }
    
    order.orderStatus=orderStatus

    if(order.orderStatus==='returned'){
      console.log('order.itme',order.items)
for(const item of order.items){
  await Product.updateOne({_Id:item.product},{$inc:{"quantity":item.quantity}})
}
let wallet = await Wallet.findOne({user})
console.log('wall',wallet)
if(!wallet){
 wallet = new Wallet({
            user,
            balance:0,
            transaction:[]

        })
        await wallet.save()
}
wallet.transaction.push({
  transactionType:'credit',
  amount:order.totalAmount,
  reason:`Refund for Order #${orderId}`

})
wallet.balance+=order.totalAmount
await wallet.save()


    }
   
    await order.save()
    return res.status(200).json({success:false,message:'order status updated'})

  } catch (error) {
    next(error)
  }
},

}
module.exports= orderController