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
                .populate({ path: 'brands', strictPopulate: false })
                .populate({ path: 'category', strictPopulate: false });

            res.render('product-list2', { product: products });
        } catch (error) {
            console.log('invoked error product list');
            console.error(error);
            res.status(500).send('Internal Server Error');
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
