const Product=require('../../models/productModel')
const Cart = require('../../models/cartModel')
const Address = require('../../models/addressModel')
const jwt = require('jsonwebtoken')
const User = require('../../models/userModel')
const Wishlist = require('../../models/wislistModel')
const checkoutController = {

    showcheckOut:async (req,res) => {
        const token = req.cookies.token
     const decoded=jwt.verify(token,process.env.JWT_SECRET)
 const userId= decoded.id;

if(!userId){
return res.status(400).json({success:false,message:'invalid input'})
}

const address = await  Address.find({user:userId})




 const user=await User.findById(userId);

if(!user){
res.status(404).redirect('/login')
 }


 let cart =await Cart.findOne({user:user._id}).populate({
    path: 'items.product',
    populate: {
        path: 'brands'
    }
})
if(!cart||cart.length===0){
return res.status(400).json({success:false,message:'cart is empty'})
}




let standartShipping=100
let expressShipping=150
let sameDayShipping=300

const shippingMethod = req.query.shipping||'standard'




 let subtotal = 0;
 let discount = 0;
 let taxRate = 0.18;
 let tax = 0;
 let total = 0;
let freeShipping = false
let shippingCharge=0

 if (cart && cart.items.length > 0) {
    cart.items.forEach(item => {
        subtotal += item.product.price * item.quantity;
    });
    if (subtotal > 19000) {
        discount = subtotal * 0.19;
    }
    if(subtotal>80000){
        freeShipping=true
        shippingCharge=0
    }
    else{
        if(shippingMethod==='express'){
            shippingCharge=expressShipping
        }else if(shippingMethod==='sameDay'){
            shippingCharge=sameDayShipping
           
        }else{
            shippingCharge=standartShipping
        }
    }

    tax = subtotal * taxRate;
    total = subtotal + tax - discount+shippingCharge;
   
}



        res.render('checkout',{user,
      
         address,
            cart: cart || null,  // Explicitly set cart to null if not found
                subtotal,
                tax,
                discount,
                shippingCharge,
                total,
               discountCode: "CYCLONE10",
               shippingOptions: {
                standard: standartShipping,
                express: expressShipping,
                sameDay: sameDayShipping
            },
            selectedShipping: shippingMethod,
            freeShipping
        })
    },
   
}
module.exports=checkoutController