const Product=require('../../models/productModel')
const Cart = require('../../models/cartModel')
const User = require('../../models/userModel')
const jwt = require('jsonwebtoken')
const Wishlist = require('../../models/wislistModel')
const Order= require('../../models/orderModel')
const Address = require('../../models/addressModel')
const { v4: uuidv4 } = require('uuid')
const { timeStamp } = require('console')


const orderController={
    placeOrder:async (req,res,next) => {
try {
    console.log('here1');
    
    const token =req.cookies.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      console.log('here2',userId)
const user = await User.findById(userId)
console.log('rewq',req.body)
if(!user){
    return res.status(400).json({success:false,message:'Unauthorized'})

}

const {totalAmount,paymentMethod,paymentStatus,address}=req.body
if(!totalAmount||!address||!paymentStatus){
    return res.status(400).json({success:false,message:'Your cart is empty. Please add some products.' })

}
const addressDoc=await Address.findById(address)
if(!addressDoc){
    return res.status(404).json({success:false,message:'Address not found'})

}
console.log('here3',addressDoc)
const cart = await Cart.findOne({user:userId})
console.log('here' ,cart)
if(!cart||!cart.items||cart.items.length===0){
    return res.status(404).json({success:false,message:'Cart is empty.Please add items to your cart before placing an order.'})


}
console.log('cart',cart)

let outOfStockItems = []
let items =[]
console.log('cartitems',cart?.items)
for(const item of cart.items)
{
    const product = await Product.findById(item.product)
if(!product){
    return res.status(404).json({success:false,message:'product not found'})

}


if(product.stock<item.quantity){
    outOfStockItems.push({
        productId:product._id,
        name:product.productName,
        requested:item.quantity,
        available:product.stock
    })
}else{
    items.push({
product:product._id,
quantity:item.quantity,
subTotal:item.quantity*product.price
    })
}

}

if(outOfStockItems.length>0){
    return res.status(400).json({success:false,message:'Some items are out of stocks',
        outOfStockItems
    })
}
const orderId= uuidv4()
console.log('orderId',orderId)
const currentDate=new Date()

const newOrder= new Order({
    orderId:orderId,
    user:userId,
    paymentMethod:paymentMethod,
    paymentStatus:paymentStatus,
    orderStatus:'pending',
    address:address,
    totalAmount:totalAmount,
    items:items,
    timestamp:currentDate
})

await newOrder.save()

await Cart.findOneAndUpdate({user:userId},{$set:{items:[]}})

let wishlist=await Wishlist.findOne({user:userId})
if(wishlist&&wishlist.product){
    const orderedProducts = items.map(or=>or.product.toString())
let newWishlist =[]
for(let pId of wishlist.product){

    if(!orderedProducts.includes(pId.toString()))
    {
        newWishlist.push(pId)
    }
}

wishlist.product = newWishlist
await wishlist.save()

}



return res.status(201).json({success:true,message:'order placed successfull',
    method: paymentMethod,
    order: newOrder
})

} catch (error) {
    next(error)
}

    },

confirmation:async (req,res,next) => {
    
    res.status(200).render('confirmation')
},
getorder:async (req,res,next) => {
    const token = req.cookies.token
    const decoded =jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    if(!userId){
        return res.status(400).json({success:false,message:'Unauthorized'})
    }

    const user = await User.findById(userId)

    if(!user){
        return res.status(404).json({success:false,message:'user not found'})
    }

    const orderlist = await Order.find({user:userId}).populate('items.product').populate('address').sort({timestamp:-1})

    // console.log('orders',orders)

if(!orderlist||orderlist.legnth===0){
    return res.status(404).render('order',{orders:[],user:user})
}
const orders ={
    items:orderlist
}
console.log('idd',orders);

    res.status(200).render('order',{orders:orders,user:user})

},


    order:async(req,res,next)=>{
try {
    const token = req.cookies.token
    const decoded =jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    if(!userId){
        return res.status(400).json({success:false,message:'Unauthorized'})
    }

    const user = await User.findById(userId)
   
    const orderId = req.params.orderId


    const order = await Order.findOne({orderId}) .populate('items.product').populate('address')
   
if(!order){
    return res.status(404).json({success:false,message:'Order not found'})
}



    res.render('orderdetails',{orders:order,user:user})
} catch (error) {
    next(error)
}      
    },
    cancelOrder:async (req,res,next) => {
        try {
console.log('para',req.params)
          const orderId = req.params.orderId
          const {cancelReason} = req.body
          console.log('peresdfsd',orderId)
          console.log('body',req.body)
          if(!orderId){
      return res.status(400).json({success:false,message:'invalid input'})
          }

      
          const order = await Order.findOne({orderId})

          if(!order){
            return res.status(404).json({success:false,message:'Order not found'})
          }
          order.cancelReason=cancelReason
          order.orderStatus="cancelled"
          await order.save()

          return res.status(200).json({success:true,message:'Order cancelled successfully'})
       
        } catch (error) {
      next(error)
        }
      
      
      },
      returnOrder:async (req,res,next) => {
        console.log('rew',req.params)
        const orderId = req.params.orderId
        const {returnReason}=req.body
        if(!orderId){
            return res.status(400).json({success:false,message:'invalid input'})
                }
      
            
                const order = await Order.findOne({orderId})
      
                if(!order){
                  return res.status(404).json({success:false,message:'Order not found'})
                }
                order.returnReason=returnReason
                order.orderStatus="return request"
                await order.save()

                return res.status(200).json({success:true,message:'Order returned successfully'})


      }

}
module.exports=orderController