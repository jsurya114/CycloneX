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
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
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

    generateInvoice: async (req, res, next) => {
        try {
          // Authentication
          const token = req.cookies.token;
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId = decoded.id;
    
          const user = await User.findById(userId);
          if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
          }
    
          // Get order ID from params
          const orderId = req.params.orderId;
          if (!orderId) {
            return res.status(400).json({ success: false, message: 'Order ID is required' });
          }
    
          // Get order details
          const order = await Order.findOne({ orderId })
            .populate('items.product')
            .populate('user', 'email firstName lastName')
            .populate('address');
    
          if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
          }
    
          // Check if user owns this order
          if (order.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
          }
    
          // Create a PDF document
          const doc = new PDFDocument({ margin: 50 });
          
          // Set response headers for PDF download
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);
          
          // Pipe the PDF document to the response
          doc.pipe(res);
          
          // Company info
          doc.fontSize(20).text('CycloneX', { align: 'center' });
          doc.fontSize(10).text('Ride Beyond Limits', { align: 'center' });
          doc.moveDown();
          
          // Add horizontal line
          doc.moveTo(50, doc.y)
             .lineTo(550, doc.y)
             .stroke();
          doc.moveDown();
          
          // Invoice title
          doc.fontSize(16).text('INVOICE', { align: 'center' });
          doc.moveDown();
          
          // Order and customer info
          doc.fontSize(10);
          doc.text(`Invoice No: INV-${orderId.substring(0, 8)}`, { align: 'right' });
          
          // Format date
          const orderDate = new Date(order.timestamp);
          const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          doc.text(`Date: ${formattedDate}`, { align: 'right' });
          doc.moveDown();
          
          // Customer details
          doc.fontSize(12).text('Customer Details:', { underline: true });
          doc.fontSize(10);
          doc.text(`Name: ${order.user.firstName || ''} ${order.user.lastName || ''}`);
          doc.text(`Email: ${order.user.email}`);
          
          // Address details
          if (order.address) {
            doc.text(`Shipping Address: ${order.address.addressLine1}, ${order.address.city}, ${order.address.state}, ${order.address.pincode}`);
          }
          doc.moveDown();
          
          // Order details
          doc.fontSize(12).text('Order Details:', { underline: true });
          doc.fontSize(10);
          doc.text(`Order ID: ${order.orderId}`);
          doc.text(`Order Date: ${formattedDate}`);
          doc.text(`Payment Method: ${order.paymentMethod}`);
          doc.text(`Payment Status: ${order.paymentStatus}`);
          doc.moveDown();
          
          // Create item table
          // Define table structure
          const tableTop = doc.y + 10;
          const itemX = 50;
          const quantityX = 300;
          const priceX = 370;
          const amountX = 450;
          
          // Add table headers
          doc.font('Helvetica-Bold');
          doc.text('Item', itemX, tableTop);
          doc.text('Qty', quantityX, tableTop);
          doc.text('Price', priceX, tableTop);
          doc.text('Amount', amountX, tableTop);
          doc.font('Helvetica');
          
          // Add horizontal line
          doc.moveTo(50, tableTop + 15)
             .lineTo(550, tableTop + 15)
             .stroke();
          
          let tableY = tableTop + 25;
          
          // Add items
          const items = order.items;
          let taxRate = 0.18; // 18% tax
          let subtotal = 0;
          
          items.forEach(item => {
            const product = item.product;
            const unitPrice = item.subTotal / item.quantity;
            subtotal += item.subTotal;
            
            doc.text(product.productName, itemX, tableY);
            doc.text(item.quantity.toString(), quantityX, tableY);
            doc.text(`₹${unitPrice.toFixed(2)}`, priceX, tableY);
            doc.text(`₹${item.subTotal.toFixed(2)}`, amountX, tableY);
            
            tableY += 20;
          });
          
          // Add horizontal line
          doc.moveTo(50, tableY)
             .lineTo(550, tableY)
             .stroke();
          tableY += 15;
          
          // Calculate totals
          const tax = subtotal * taxRate;
          const discount = 0; // Add logic for discount if applicable
          const total = subtotal + tax - discount;
          
          // Add totals
          doc.text('Subtotal:', 350, tableY);
          doc.text(`₹${subtotal.toFixed(2)}`, amountX, tableY);
          tableY += 20;
          
          doc.text('Tax (18%):', 350, tableY);
          doc.text(`₹${tax.toFixed(2)}`, amountX, tableY);
          tableY += 20;
          
          if (discount > 0) {
            doc.text('Discount:', 350, tableY);
            doc.text(`₹${discount.toFixed(2)}`, amountX, tableY);
            tableY += 20;
          }
          
          // Add horizontal line
          doc.moveTo(350, tableY)
             .lineTo(550, tableY)
             .stroke();
          tableY += 15;
          
          // Total
          doc.font('Helvetica-Bold');
          doc.text('Total:', 350, tableY);
          doc.text(`₹${total.toFixed(2)}`, amountX, tableY);
          doc.font('Helvetica');
          
          // Add footer
          doc.moveDown(4);
          doc.fontSize(10).text('Thank you for shopping with CycloneX!', { align: 'center' });
          doc.text('For any inquiries, please contact us at cyclonex.gethelp@gmal.com', { align: 'center' });
          
          // Finalize the PDF
          doc.end();
        } catch (error) {
          next(error);
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