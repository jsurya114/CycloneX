const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');
const adminAuth = require('../../controllers/admin/adminAuth');
const adminAuths =require('../../middlewares/adminsAuth')
const verifyAdmin = require('../../middlewares/adminsAuth')
const productController = require('../../controllers/admin/productController')
const  upload = require('../../config/multer')
const categoryController = require('../../controllers/admin/categoryController')
const orderController = require('../../controllers/admin/orderController')
const productloader = require('../../controllers/admin/productloader')
const nocache =require('../../middlewares/nocache')
const ensureAuth = require('../../middlewares/ensureAuth');
const couponController = require('../../controllers/admin/couponController');
const salesController = require('../../controllers/admin/salesController')
const dashboardController=require('../../controllers/admin/dashboardController');
const walletController=require('../../controllers/admin/wallet');
const brandController = require('../../controllers/admin/brandController');


router.use(nocache);
router.get('/login',ensureAuth,nocache, adminAuth.login);
router.post('/login', adminAuth.loginPost); // Handle login form submission
router.get('/dashboard',verifyAdmin,dashboardController.getdashboard)
router.get('/dashboard/download-pdf', dashboardController.downloadPdf);
router.get('/salesreport',verifyAdmin , salesController.getSaleReport);
router.post('/sales/downloadPdf', salesController.downloadPDF);
router.post('/sales/downloadExcel', salesController.downloadEXCEL);
router.get('/logout',adminAuth.logout)

// router.get('/product-list',adminController.product)
router.get('/product-list2',verifyAdmin,adminController.product2)
router.get('/product/:id',verifyAdmin,adminController.showproductDetails)
router.get('/addproduct',verifyAdmin,productController.showAddProductPage)

router.post(
    '/addproduct',
    upload.fields([
      { name: 'mainImage', maxCount: 1 },
      { name: 'images', maxCount: 4 }
    ]),
    productController.addproduct
  );
router.get('/editproduct/:id',verifyAdmin,productloader.showeditProduct)
router.put(
  '/editproduct/:id',
  upload.fields([
      { name: 'mainImage', maxCount: 1 },
      { name: 'images', maxCount: 4 }
  ]),
  productloader.editProduct
);
router.delete('/delete-product-image/:id', productloader.deleteProductImage);
router.put('/toggle-product/:id', productloader.productsoftdelete);

router.get('/brands', verifyAdmin,brandController.showBrandPage);

router.post('/brands/addbrand',brandController.addBrand)
router.get('/editbrand/:id',verifyAdmin,brandController.showEditBrandPage)
router.put('/editbrand/:id',brandController.editbrand)
router.put('/brand/listing/:id', brandController.listing);
router.get('/category',verifyAdmin,categoryController.category)
router.post('/category/add',categoryController.addCategory)
router.get('/category/edit/:id',verifyAdmin,categoryController.showEditCategrory)
router.put('/category/edit/:id',categoryController.editcategory)
router.put('/category/listing/:id', categoryController.listing)

router.get('/userlist',verifyAdmin,adminController.userlist)
router.get('/userdetails/:id',verifyAdmin, adminController.showUserdetails);
router.put('/toggle-user/:id',adminController.listinguser)
router.get('/api/users',verifyAdmin,adminController.filtering)
router.get('/adminwallet',verifyAdmin,walletController.getAdminWallet)
router.get('/transaction/:transactionId', verifyAdmin, walletController.getTransactionDetails)

router.get('/orderlist',verifyAdmin,orderController.getorderlist)

router.get('/orderdetailss/:id',verifyAdmin,orderController.showOrderDetails)
router.post('/updateorderstatus/:id',orderController.updateOrderStatus)
router.get('/coupons',verifyAdmin,couponController.getCoupon)
router.post('/addcoupon',couponController.addCoupon)
router.put('/listcoupon/:couponId',couponController.couponBlocking)
router.get('/editcoupon/:couponId',verifyAdmin,couponController.showEditCoupon)
router.put('/editcoupon/:couponId',couponController.editCoupon)
module.exports = router;
