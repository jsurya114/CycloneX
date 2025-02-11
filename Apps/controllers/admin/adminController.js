const Admin = require('../../models/adminModel');
const bcrypt = require('bcryptjs');

const adminController = {
   

    dashboard: async (req, res) => {
        res.render('dashboard');
    },
    category:async (req,res)=>{
      res.render('category')
    },
    product: async (req,res)=>{
        res.render('product-list')
    },
    product2: async (req,res)=>{
        res.render('product-list2')
    },
   addproduct: async (req,res)=>{
        res.status(200).render('addproduct')
    },
   brands: async (req,res)=>{
        res.render('brands')
    },
   

    adduser: async (req, res) => {
        res.send('This is the add user page');
    },

    deleteuser: async (req, res) => {
        res.send('This is the delete user page');
    },

  
};

module.exports = adminController;
