const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');
const adminAuth = require('../../controllers/admin/adminAuth');
const verifyAdmin = require('../../middlewares/adminsAuth')
const productController = require('../../controllers/admin/productController')
const  upload = require('../../config/multer')
const categoryController = require('../../controllers/admin/categoryController')
const productloader = require('../../controllers/admin/productloader')
router.get('/login', adminAuth.login);
router.post('/login', adminAuth.loginPost); // Handle login form submission
router.get('/dashboard',verifyAdmin, adminController.dashboard);
router.get('/logout',adminAuth.logout)

// router.get('/product-list',adminController.product)
router.get('/product-list2',adminController.product2)
router.get('/product/:id',adminController.showproductDetails)
router.get('/addproduct',productController.showAddProductPage)

router.post('/addproduct',upload.array('images',4),productController.addproduct)
router.get('/editproduct/:id',productloader.showeditProduct)
router.put('/editproduct/:id',upload.array('productImage'),productloader.editProduct)
router.put('/toggle-product/:id', productloader.productsoftdelete);

router.get('/brands', productController.showAddBrandPage);

router.post('/addbrand',upload.single('brandLogo') ,productController.addBrand);
router.get('/editbrand/:id',productController.showEditBrandPage)
router.put('/editbrand/:id', upload.single('brandLogo'), productController.editbrand);
router.put('/brand/listing/:id', productController.listing);
router.get('/category',categoryController.category)
router.post('/category/add',upload.single('image'),categoryController.addCategory)
router.get('/category/edit/:id',categoryController.showEditCategrory)
router.put('/category/update/:id',upload.single('image'),categoryController.editcategory)
router.put('/category/listing/:id', categoryController.listing)
router.delete('/category/delete', categoryController.deleteCategories);

 
module.exports = router;
