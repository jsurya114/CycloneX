const Address = require('../../models/addressModel')
const Product = require('../../models/productModel')
const Order = require('../../models/orderModel')
const User = require('../../models/userModel')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const orderController ={
 getorderlist:async (req,res,next) => {
try{

console.log('reacjed')
  const order= await Order.find().populate('address').populate('user')
  console.log('orderss',order)
console.log('reached3tyui')
  const orderData = order.map(order => ({
   _id: order._id,
   fullName: order.user ? order.user.fullName  : "Guest",
   email: order.user ? order.user.email : "N/A",
   totalAmount: order.totalAmount,
   status: order.orderStatus,
   timestamp: order.timestamp
 }))
 console.log('orderdata',orderData)
    res.status(200).render('orderlist',{orders:orderData}) 

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
    console.log('this is order',order)
    if(!order){
      return res.status(404).send('order not found')
    }
    
    order.orderStatus=orderStatus
   
    await order.save()
    return res.status(200).json({success:false,message:'order status updated'})

  } catch (error) {
    next(error)
  }
},

}
module.exports= orderController