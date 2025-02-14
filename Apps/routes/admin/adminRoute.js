const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');
const adminAuth = require('../../controllers/admin/adminAuth');
const verifyAdmin = require('../../middlewares/adminsAuth')
const productController = require('../../controllers/admin/productController')
const upload = require('../../config/multer')
router.get('/login', adminAuth.login);
router.post('/login', adminAuth.loginPost); // Handle login form submission
router.get('/dashboard',verifyAdmin, adminController.dashboard);
router.get('/logout',adminAuth.logout)

router.get('/product-list',adminController.product)
router.get('/product-list2',adminController.product2)

router.get('/addproduct',productController.showAddProductPage)
router.post('/addproduct',productController.addproduct)
router.get('/brands', productController.showAddBrandPage);
router.get('/addbrand',productController.addBrand)
router.post('/addbrand',upload.single('brandLogo') ,productController.addBrand);
router.get('/category',adminController.category)


module.exports = router;
