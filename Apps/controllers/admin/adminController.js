const User = require('../../models/userModel');

const Product = require('../../models/productModel');
const Brand = require('../../models/brandModel')
const Category = require('../../models/categoryModel')
const Productloader = require('../admin/productloader');
const { category } = require('./categoryController');
const adminController = {
    dashboard: (req, res) => {
        res.render('dashboard');
    },

    product2: async (req, res) => {
        try {
            const products = await Product.find()
                .populate('brands')
                .populate('category').sort({createdAt:-1})
const categories = await Category.find()
const brands =await Brand.find()
            res.render('product-list2', { products,
                categories ,
                brands,
            success:req.query.added==='true'});
        } catch (error) {
            console.log('invoked error product list');
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    showproductDetails:async (req,res) => {
        try{
            const productId = req.params.id
            const product =await Product.findById(productId).populate('category').populate('brands')
            if(!product){
                return res.status(404).redirect('/admin/product-list2')
            }
            res.render('product-details',{product})
        }catch(error){
            console.error('Error fetching product details:', error);
            res.status(500).redirect('/admin/product-list2');
    
        }
    },
    
    userlist:async (req,res) => {
        try {
            const user = await User.find()
            res.render('userlist',{user,message:null})
        } catch (error) {
            console.log(error)
            res.status(500).send('internal server error')
        }
    },
    showUserdetails:async (req,res) => {
        try {
            const userId = req.params.id
            if(!userId){
                return res.status(400).redirect('/admin/userlist')
            }
            const user = await User.findById(userId)
            if(!user){
                return res.status(404).redirect('/admin/userlist')
            }
            res.render('userdetails',{user,message:null})
        } catch (error) {
            res.status(500).send('internal server error')
        }
    },
    listinguser:async (req,res) => {
        try {
            const userId = req.params.id
            const user = await User.findById(userId)
            if(!user){
                return res.status(404).json({
                    success: false,
                    message: 'user not found'
                  });
            }
            user.isActive = !user.isActive
            await user.save()
            res.status(200).json({
                success: true,
                message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
              });
        } catch (error) {
            console.error(error);
      res.status(500).json({ success: false, message: 'Error listing user status' })
        }
    },
    filtering: async (req, res) => {
        try {
            let { search, status, limit, sort, order } = req.query;
            let filter = {};
    
            if (search) {
                filter.$or = [
                    { fullName: new RegExp(search, "i") },
                    { email: new RegExp(search, "i") }
                ];
            }
    
            if (status) {
                filter.isActive = status === "Active";
            }
    
            const users = await User.find(filter)
                .sort({ [sort || "fullName"]: order === "desc" ? -1 : 1 })
                .limit(Number(limit) || 20);
    
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    }
    
    
};

module.exports = adminController;
