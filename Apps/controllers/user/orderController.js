const Product = require('../../models/productModel')
const Cart = require('../../models/cartModel')
const User = require('../../models/userModel')
const jwt = require('jsonwebtoken')
const Wishlist = require('../../models/wislistModel')
const Coupon = require('../../models/couponModel')
const Order = require('../../models/orderModel')
const Address = require('../../models/addressModel')
const Wallet = require('../../models/walletModel')
const { v4: uuidv4 } = require('uuid')
const { timeStamp } = require('console')
const Admin = require('../../models/adminModel')
const AdminWallet = require('../../models/adminWalletModel')
const generateTransactionId = require('../../services/transactionids')

const orderController = {
    placeOrder: async (req, res, next) => {
        try {


            const token = req.cookies.token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;

            const user = await User.findById(userId)
            if (!user) {
                return res.status(400).json({ success: false, message: 'Unauthorized' })

            }


            const { productId, totalAmount, paymentMethod, paymentStatus, address, couponCode } = req.body

            if (!totalAmount || !address || !paymentStatus) {
                return res.status(400).json({ success: false, message: 'Your cart is empty. Please add some products.' })

            }
            const addressDoc = await Address.findById(address)//actually we are taking the addressId
            if (!addressDoc) {
                return res.status(404).json({ success: false, message: 'Address not found' })

            }

            const cart = await Cart.findOne({ user: userId })
            if (!cart || !cart.items || cart.items.length === 0) {
                return res.status(404).json({ success: false, message: 'Cart is empty.Please add items to your cart before placing an order.' })


            }
            if (totalAmount > 18000) {
                return res.status(302).json({ success: false, message: 'please use online payment orders above 18000' })
            }

            const coupon = await Coupon.findOne({ couponCode: couponCode })

            if (coupon) {
                coupon.usedBy.push(userId)
                await coupon.save()
            }

            let outOfStockItems = []
            let items = []
            for (const item of cart.items) {
                const product = await Product.findById(item.product).populate('category')
                if (!product) {
                    return res.status(404).json({ success: false, message: 'product not found' })

                }
                if (product.isDeleted || product.category && product.category.isBlocked) {
                    return res.status(400).json({ success: false, message: 'Product is unavailable' })
                }


                if (product.stock < item.quantity) {
                    outOfStockItems.push({
                        productId: product._id,
                        name: product.productName,
                        requested: item.quantity,
                        available: product.stock
                    })
                } else {
                    items.push({
                        product: product._id,
                        quantity: item.quantity,
                        subTotal: item.quantity * item.salePrice
                    })
                }

            }

            if (outOfStockItems.length > 0) {
                return res.status(400).json({
                    success: false, message: 'Some items are out of stocks',
                    outOfStockItems
                })
            }
            const orderId = uuidv4()


            const currentDate = new Date()

            const newOrder = new Order({
                orderId: orderId,
                user: userId,
                paymentMethod: paymentMethod.toLowerCase().trim(),
                paymentStatus: paymentMethod.toLowerCase() === "razorpay" ? "processing" : "pending",
                orderStatus: 'processing',
                address: address,
                totalAmount: totalAmount,
                items: items,
                timestamp: currentDate,
            })
            
            
            await newOrder.save()


            for (let item of newOrder.items) {
                await Product.updateOne({ _id: item.product._id }, { $inc: { stock: -item.quantity } })
            }



            await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } })

            let wishlist = await Wishlist.findOne({ user: userId })
            if (wishlist && wishlist.product) {
                const orderedProducts = items.map(or => or.product.toString())
                let newWishlist = []
                for (let pId of wishlist.product) {

                    if (!orderedProducts.includes(pId.toString())) {
                        newWishlist.push(pId)
                    }
                }

                wishlist.product = newWishlist
                await wishlist.save()

            }




            return res.status(201).json({
                success: true, message: 'order placed successfully',
                method: paymentMethod,
                order: newOrder
            })

        } catch (error) {
            next(error)
        }

    },

    confirmation: async (req, res, next) => {
        try {
           
            
            const orderId = req.params.orderId;
            const token = req.cookies.token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const userId = decoded.id
            const user = await User.findById(userId)
            
            const order = await Order.findOne({ orderId }).populate('items.product').populate('address')
            res.status(200).render('confirmation', {order})   
        } catch (err) {
            next(err)
        }
    },
    getorder: async (req, res, next) => {
        try {
            const token = req.cookies.token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const userId = decoded.id

            if (!userId) {
                return res.status(400).json({ success: false, message: 'Unauthorized' })
            }

            const user = await User.findById(userId)

            if (!user) {
                return res.status(404).json({ success: false, message: 'user not found' })
            }
            let cartfind = await Cart.findOne({ user: userId })
            const cartCount = cartfind.items.length
            const { search } = req.query

            let filter = {};

            if (search) {
                filter.$or = [{ productName: { $regex: search.trim(), $options: "i" } }]
            }
            let page = parseInt(req.query.page) || 1
            let limit = parseInt(req.query.limit) || 3

            let currentPage = page
            let itemsPerPage = limit
            let skip = (currentPage - 1) * itemsPerPage

            const orderlist = await Order.find({ user: userId, ...filter }).populate('items.product').populate('address').sort({ timestamp: -1 }).limit(itemsPerPage).skip(skip)


            if (!orderlist || orderlist.length === 0) {
                return res.status(404).render('order', { orders: [], user: user, cartCount: cartCount })
            }
            const orders = {
                items: orderlist
            }



            let totalOrders = await Order.countDocuments({ user: userId, ...filter })
            let totalPages = Math.ceil(totalOrders / itemsPerPage)
            res.status(200).render('order', {
                orders: orders, user: user, cartCount: cartCount,
                currentPage,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                prevPage: currentPage > 1 ? currentPage - 1 : null,


            })
        } catch (error) {
            next(error)
        }
    },


    order: async (req, res, next) => {
        try {
           
            
            const token = req.cookies.token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const userId = decoded.id

            if (!userId) {
                return res.status(400).json({ success: false, message: 'Unauthorized' })
            }

            const user = await User.findById(userId)
            let cartfind = await Cart.findOne({ user: userId })
            const cartCount = cartfind.items.length

            const orderId = req.params.orderId


            const order = await Order.findOne({ orderId }).populate('items.product').populate('address')
            
            

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' })
            }




            res.render('orderdetails', { orders: order, user: user, cartCount: cartCount })
        } catch (error) {
            next(error)
        }
    },
    cancelOrder: async (req, res, next) => {
        try {

            const token = req.cookies.token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;

            const user = await User.findById(userId)

            if (!user) {
                return res.status(400).json({ success: false, message: 'Unauthorized' })

            }


            const orderId = req.params.orderId
            const { cancelReason } = req.body

            if (!orderId) {
                return res.status(400).json({ success: false, message: 'invalid input' })
            }


            const order = await Order.findOne({ orderId }).populate('items.product')

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' })
            }

            if (order.paymentMethod === 'Razorpay') {

                order.paymentStatus = 'refunded'
                let admin = await Admin.findOne()

                let adminWallet = await AdminWallet.findOne()


                if (!adminWallet) {
                    adminWallet = new AdminWallet({
                        admin: admin._id,
                        balance: 0,
                        transaction: []

                    })
                }
                let transactionId = generateTransactionId.generateTransactionId()
                adminWallet.transaction.push({ transactionType: 'debit', amount: order.totalAmount, reason: `debit of Order ${orderId}`, transactionId: transactionId })
                adminWallet.balance -= order.totalAmount
                await adminWallet.save()

                let wallet = await Wallet.findOne({ user: userId })
                if (!wallet) {
                    wallet = await Wallet.create({ user: userId, balance: 0, transaction: [] })

                }
                wallet.transaction.push({ transactionType: 'credit', amount: order.totalAmount, reason: `Refund for Order ${orderId}` })

                wallet.balance += order.totalAmount
                await wallet.save()

                for (let item of order.items) {
                    await Product.updateOne({ _id: item.product._id }, { $inc: { stock: item.quantity } })
                }

                order.cancelReason = cancelReason
                order.orderStatus = "cancelled"


                await order.save()

                return res.status(200).json({
                    message: "Order Cancelled! Your money will be credited to your wallet.",
                    success: true,
                });





            }


            for (let item of order.items) {
                await Product.updateOne({ _id: item.product._id }, { $inc: { stock: item.quantity } })
            }

            order.cancelReason = cancelReason
            order.orderStatus = "cancelled"
            await order.save()

            return res.status(200).json({ success: true, message: 'Order cancelled successfully' })

        } catch (error) {
            next(error)
        }


    },
    returnOrder: async (req, res, next) => {

        try {
            const token = req.cookies.token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;

            const user = await User.findById(userId)

            if (!user) {
                return res.status(400).json({ success: false, message: 'Unauthorized' })

            }


            const orderId = req.params.orderId
            const { returnReason } = req.body
            if (!orderId) {
                return res.status(400).json({ success: false, message: 'invalid input' })
            }


            const order = await Order.findOne({ orderId }).populate('items.product')

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' })
            }




            order.returnReason = returnReason
            order.orderStatus = "return request"
            await order.save()



            return res.status(200).json({ success: true, message: 'Order return request successfully' })
        } catch (error) {
            next(error)
        }


    }

}
module.exports = orderController