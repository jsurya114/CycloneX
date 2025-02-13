const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');
const adminAuth = require('../../controllers/admin/adminAuth');
const verifyAdmin = require('../../middlewares/adminsAuth')

router.get('/login', adminAuth.login);
router.post('/login', adminAuth.loginPost); // Handle login form submission
router.get('/dashboard',verifyAdmin, adminController.dashboard);
router.get('/logout',adminAuth.logout)

router.get('/product-list',adminController.product)
router.get('/product-list2',adminController.product2)

router.get('/brands',adminController.brands)
router.post('/addbrand',adminController.addbrand)
router.get('/category',adminController.category)

module.exports = router;
