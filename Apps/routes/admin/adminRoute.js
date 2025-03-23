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
router.get('/login',ensureAuth,nocache, adminAuth.login);
router.post('/login', adminAuth.loginPost); // Handle login form submission
router.get('/dashboard',verifyAdmin , salesController.getSaleReport);
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

router.get('/brands', productController.showAddBrandPage);

router.post('/addbrand',upload.single('brandLogo') ,productController.addBrand);
router.get('/editbrand/:id',verifyAdmin,productController.showEditBrandPage)
router.put('/editbrand/:id', upload.single('brandLogo'), productController.editbrand);
router.put('/brand/listing/:id', productController.listing);
router.get('/category',verifyAdmin,categoryController.category)
router.post('/category/add',upload.single('image'),categoryController.addCategory)
router.get('/category/edit/:id',verifyAdmin,categoryController.showEditCategrory)
router.put('/category/update/:id',upload.single('image'),categoryController.editcategory)
router.put('/category/listing/:id', categoryController.listing)

router.get('/userlist',verifyAdmin,adminController.userlist)
router.get('/userdetails/:id', adminController.showUserdetails);
router.put('/toggle-user/:id',adminController.listinguser)
router.get('/api/users',adminController.filtering)
router.get('/orderlist',verifyAdmin,orderController.getorderlist)

router.get('/orderdetailss/:id',verifyAdmin,orderController.showOrderDetails)
router.post('/updateorderstatus/:id',orderController.updateOrderStatus)
router.get('/coupons',verifyAdmin,couponController.getCoupon)
router.post('/addcoupon',couponController.addCoupon)
router.put('/listcoupon/:couponId',couponController.couponBlocking)
router.get('/editcoupon/:couponId',couponController.showEditCoupon)
router.put('/editcoupon/:couponId',couponController.editCoupon)
module.exports = router;
