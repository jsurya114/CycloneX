const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/login', adminController.login);
router.post('/login', adminController.loginPost); // Handle login form submission
router.get('/dashboard', adminController.dashboard);
router.get('/product-list',adminController.product)
router.get('/product-list2',adminController.product2)
router.get('/addproduct',adminController.addproduct)
router.get('/brands',adminController.brands)
router.get('/category',adminController.category)
module.exports = router;
