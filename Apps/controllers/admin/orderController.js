const Address = require('../../models/addressModel')
const Product = require('../../models/productModel')
const Order = require('../../models/orderModel')
const AdminWallet = require('../../models/adminWalletModel')
const User = require('../../models/userModel')
const Wallet = require('../../models/walletModel')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Admin = require('../../models/adminModel')

const generateTransactionId=require('../../services/transactionids')
const orderController ={
 getorderlist:async (req,res,next) => {
try{




const { search, status, sort, page = 1, limit = 4 } = req.query;
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
const limitNum = parseInt(limit) || 4

  const order= await Order.find(filter).populate('address').populate('user').sort(sortOptions[sort] || { timestamp: -1 })
  .skip((pageNum - 1) * limitNum)
  .limit(limitNum)
  .limit(parseInt(limit))
 
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

 const token = req.cookies.token;
               const decoded = jwt.verify(token, process.env.JWT_SECRET);
               
              const adminId =decoded.id
    
 
    const orderStatus =req.body.orderStatus
    const orderId = req.params.id

    const order = await Order.findOne({orderId})
    const user=order.user.toString()
  
    if(!order){
      return res.status(404).send('order not found')
    }
    if(order.orderStatus==='delivered'){
      return res.status(400).json({success:false,message:'delivered order cannot be edited'})
    }
    
    order.orderStatus=orderStatus


    if(order.orderStatus==='delivered'&&order.paymentMethod==='cod'){
    order.paymentStatus='paid'
let adminWallet= await AdminWallet.findOne({})

if(!adminWallet){
  adminWallet= new AdminWallet({
    admin:adminId,
    balance:0,
    transaction:[]
  })
  await adminWallet.save()

}

let transactionId=generateTransactionId.generateTransactionId()
adminWallet.transaction.push({
  transactionType:'credit',
  amount:order.totalAmount,
  reason:`credit for Order #${orderId}`,
  transactionId:transactionId

})
adminWallet.balance+=order.totalAmount
await adminWallet.save()
    }

    if(order.orderStatus==='returned'){
      console.log('order.itme',order.items)
for(const item of order.items){
  await Product.updateOne({_id:item.product},{$inc:{stock:item.quantity}})
}

let adminWallet = await AdminWallet.findOne({})
if(!adminWallet){
  adminWallet = new AdminWallet({
    admin:adminId,
    balance:0,
    transaction:[]
  })
  await adminWallet.save()
}
const transactionId=generateTransactionId.generateTransactionId()
adminWallet.transaction.push({  transactionType:'debit',
  amount:order.totalAmount,
  reason:`debit for Order #${orderId}`,
  transactionId:transactionId})
  adminWallet.balance-=order.totalAmount
  await adminWallet.save()
      


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
order.paymentStatus='refunded'

await order.save()
    }
   
    await order.save()
    return res.status(200).json({success:true,message:'order status updated'})

  } catch (error) {
    next(error)
  }
},

}
module.exports= orderController