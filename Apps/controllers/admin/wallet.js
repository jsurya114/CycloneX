const AdminWallet = require('../../models/adminWalletModel')
const Order = require('../../models/orderModel')
const Cart = require('../../models/cartModel')
const jwt = require('jsonwebtoken')
const Admin = require('../../models/adminModel')
const User = require('../../models/userModel')


const walletController = {
    getAdminWallet: async (req, res, next) => {
        try {
         const token = req.cookies.token;
               const decoded = jwt.verify(token, process.env.JWT_SECRET);
               
              const adminId =decoded.id 
              const {search,transactionType,page,limit}=req.query
              
           

              let cp = page||1
              let ip  =limit||4
              let skip =(cp-1)*ip
              

              let adminWallet = await AdminWallet.findOne({admin:adminId}).populate('transaction.orderId')
           
if(!adminWallet){
    adminWallet= new AdminWallet({
admin:adminId,
balance:0,
transaction:[],
    })
    await adminWallet.save()
}
let transactions = adminWallet.transaction
if(search){
  transactions=transactions.filter(tr=>tr.transactionId.toLowerCase().includes(search.toLowerCase()))
}

if(transactionType==='credit'){
  transactions=transactions.filter(tr=>tr.transactionType==='credit')
}else if(transactionType==='debit'){
  transactions=transactions.filter(tr=>tr.transactionType==='debit')
}

const transactionIds = adminWallet.transaction.map(tr => tr.transactionId);


const totalTransactions = adminWallet.transaction.length
let totalPages = Math.ceil(totalTransactions/ip)
const totalCredits = adminWallet.transaction.reduce((sum, tr) => {
    return tr.transactionType === 'credit' ? sum + Number(tr.amount) : sum;
}, 0);

const totalDebits = adminWallet.transaction.reduce((sum, tr) => {
    return tr.transactionType === 'debit' ? sum + Number(tr.amount) : sum;
}, 0);


const Pagination =transactions.slice(skip,skip+ip)
adminWallet.transaction=Pagination
transactions.sort((a,b)=>new Date(b.date)-new Date(a.date))

            return res.status(200).render('adminwallet',{adminId,adminWallet,totalTransactions,totalCredits,totalDebits,
              cp,totalPages,
              search,
              hasNextPage:cp<totalPages,
              hasPrevPage:cp>1,
              nextPage:cp<totalPages?cp+1:null,
              prevPage:cp>1?cp-1:null,
              transactionType
            })
        } catch (error) {
            next(error)
        }
    },
    returnToWallet:async (req,res,next) => {
        try {
            const token = req.cookies.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
           const adminId =decoded.id 

      
           const {orderId}=req.params
           const {returnReason,returnDetails,returnItems}=req.body

const order = await Order.findById(orderId).populate('items.product')
if(!order){
    return res.status(404).json({success:false,message:'order not foound'})
}

if(order.orderStatus!=='delivered'){
    return res.status(400).json({success:false,message:'Only delivered orders can be returned'})
}
order.returnReason=returnReason
await order.save()
const adminWallet = await AdminWallet.findOne({admin:adminId}).populate('transaction.orderId').sort({timestamp:-1})
if(!adminWallet){
    adminWallet= new AdminWallet({
admin:adminId,
balance:0,
transaction:[],
    })
    await adminWallet.save()
}


        } catch (error) {
           next(error) 
        }
    },
    getTransactionDetails: async (req, res, next) => {
        try {
          const token = req.cookies.token;
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const adminId = decoded.id;
          const { transactionId } = req.params;
          let adminWallet = await AdminWallet.findOne({ admin: adminId });
      
          if (!adminWallet) {
            return res.status(404).json({
              success: false,
              message: 'Admin wallet not found'
            });
          }
      
          const transaction = adminWallet.transaction.find(
            (tr) => tr.transactionId === transactionId
          );
      
          if (!transaction) {
            return res.status(404).json({
              success: false,
              message: 'Transaction not found'
            });
          }
       
          const userId = transaction.user;
          const user = await User.findById(userId)
          
      
          // Populate order details if present
          if (transaction.orderId) {
            await adminWallet.populate({
                path: 'transaction.orderId',
                populate: {
                  path: 'user',
                  select: 'fullName email profileImage'
                }
              });              
          }
      
          const populatedTransaction = adminWallet.transaction.find(
            (tr) => tr.transactionId === transactionId
          );
      
          const userDetails = user;
        
            
          

        
      
          return res.status(200).render('transactionDetails', {
            transaction: populatedTransaction,
            userDetails: userDetails 
          });
        } catch (error) {
          next(error);
        }
      }
}

module.exports = walletController