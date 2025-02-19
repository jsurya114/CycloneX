const Admin = require('../../models/adminModel');
const bcrypt = require('bcryptjs');
const upload = require('../../config/multer')
const Product = require('../../models/productModel');
const Brand = require('../../models/brandModel')
const Category = require('../../models/categoryModel')
const Productloader = require('../admin/productloader')

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
    
    brands: (req, res) => {
        res.render('brands');
    },

    addbrand: (req, res) => {
        res.render('addbrand');
    },

    adduser: (req, res) => {
        res.send('This is the add user page');
    },
};

module.exports = adminController;
