const Admin = require('../../models/adminModel');
const bcrypt = require('bcryptjs');

const adminController = {
   

    dashboard:  (req, res) => {
        res.render('dashboard');
    },
    category: (req,res)=>{
      res.render('category')
    },
    product: (req,res)=>{
        res.render('product-list')
    },
    product2:  (req,res)=>{
        res.render('product-list2')
    },
  
   brands:  (req,res)=>{
        res.render('brands')
    },
    addbrand:(req,res)=>{
        res.render('addbrand')
    },
   

    adduser: (req, res) => {
        res.send('This is the add user page');
    },

    deleteuser: (req, res) => {
        res.send('This is the delete user page');
    },

  
};

module.exports = adminController;
