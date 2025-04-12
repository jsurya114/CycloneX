const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user/authController');
const passport = require('passport');
require('../../config/passport');
const verifyUser = require('../../middlewares/userAuth');
const userEnsure = require('../../middlewares/userEnsure');
const userAuth = require('../../middlewares/userAuth');
const nocache = require('../../middlewares/nocache');
const userController=require('../../controllers/user/userController')
const passwordController = require('../../controllers/user/passwordcontroller');
const shopController = require('../../controllers/user/shopController');

const cartController = require('../../controllers/user/cartController')

const checkoutController = require('../../controllers/user/checkoutController');
const { verify } = require('crypto');
const addressController = require('../../controllers/user/addressController');
const orderController = require('../../controllers/user/orderController');
const walletController = require('../../controllers/user/walletController');
const reviewController = require('../../controllers/user/reviewController');
const settingController = require('../../controllers/user/settingsController');
const RazorpayController = require('../../controllers/user/razorpayController');
const feedback = require('../../controllers/user/feedback')



router.use(userEnsure,nocache);
router.get('/',authController.landing)
router.get('/login', userEnsure, nocache, authController.logins);
router.post('/', authController.loginspost);
router.get('/signup', authController.signup);
router.post('/signup', authController.createUser);
router.post('/verify-otp',  authController.verifyOTP);
router.post('/resend-otp',  authController.resendOTP);


router.get('/forgotpassword',userEnsure,passwordController.showforgotpassword)
router.post('/forgotpassword',passwordController.forgotpassword)
router.post('/verifyAndUpdatePassword',passwordController.verifyAndUpdatePassword)
router.post('/resendotp',passwordController.resendOTP)
router.get('/resetpassword',passwordController.showresetpassword)
router.post('/resetpassword',passwordController.resetPassword)
// Google authentication routes
console.log('invoked routes');
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
console.log('invoked route');

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  console.log('Google OAuth successful, user:', req.user);
  const token = req.user.token
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.redirect('/home');
});

router.get('/home', verifyUser, nocache, userController.home);

router.get('/shoplist',shopController.shopList)
router.post('/shoplist',shopController.shopList)
router.get('/productdetails/:id',userController.productDetails)

router.get('/about',verifyUser,authController.aboutAs)
router.post('/about/send',feedback.sendEmail)
router.get('/logout', verifyUser, authController.logout);

router.get('/userprofile/:userId',verifyUser,userEnsure,userController.showUserProfile)
router.post('/userprofile/:userId',userController.userAddress)

router.get('/addaddress/:userId',verifyUser,addressController.getUserAddress)
router.get('/addaddress/:userId/:addressId',verifyUser,addressController.specificAddress)
router.post('/addaddress/:userId',addressController.manageAddress)
router.delete('/addaddress/:userId/:addressId',addressController.deleteAddress)





router.get('/addtocart',verifyUser,cartController.showCartPage)
router.post('/addtocart',cartController.addToCart)
router.put('/addtocart/:productId',cartController.updateQuantity)
router.delete('/addtocart/:productId',cartController.removeFromCart)
router.get('/wishlist',verifyUser,cartController.showWhishlistPage)
router.post('/wishlistStatus',cartController.addToWishlist)
router.post('/wishlist',cartController.addToWishlist)
router.delete('/wishlist/:productId',cartController.removeFromWishlist)


router.get('/settings/:id', verifyUser, settingController.userSettings);
router.post('/updateEmail', settingController.sendOtps); // Sends OTP
router.post('/verifyEmailOtp', settingController.verifyAndUpdate)

router.post('/sendPasswordOtp', settingController.passwordSentOtp);
router.post('/verifyPasswordOtp', settingController.passwordOtpverify);

router.get('/checkout',verifyUser,checkoutController.showcheckOut)
router.post('/checkout/addaddress',checkoutController.userAddress)
router.put('/checkout/:productId',cartController.updateQuantity)
router.delete('/checkout/:productId',cartController.removeFromCart)
router.get('/checkout/:productId', verifyUser, checkoutController.showcheckOut);
router.post('/razorPay/createOrder',RazorpayController.createRazorpay)
router.post('/razorPay/verifyPayment',RazorpayController.verifyRazorPayment)
router.get('/paymentfailure',verifyUser,RazorpayController.failure)




router.get('/review/:id/:orderId',verifyUser,reviewController.loadReview)
router.post('/review/:id/:orderId',reviewController.submitReview)

router.get('/order',verifyUser,orderController.getorder)

router.get('/orderdetails/:orderId',orderController.order)

router.post('/orders/cod',orderController.placeOrder)

router.get('/confirmation',verifyUser,orderController.confirmation)
router.put('/order/cancel/:orderId',orderController.cancelOrder)
router.put('/order/return/:orderId',orderController.returnOrder)
router.get('/wallet',verifyUser,walletController.getWallet)
router.post('/order/return/:orderId',walletController.returnWallet)
router.post('/applycoupon',checkoutController.applyCoupon)


module.exports = router;
