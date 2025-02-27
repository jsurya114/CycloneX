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

router.use(userEnsure);

router.get('/', userEnsure, nocache, authController.logins);
router.post('/', authController.loginspost);
router.get('/signup', authController.signup);
router.post('/signup', authController.createUser);
router.post('/verify-otp',  authController.verifyOTP);
router.post('/resend-otp',  authController.resendOTP);


router.get('/forgotpassword',userEnsure,passwordController.showforgotpassword)
router.post('/forgotpassword',passwordController.forgotpassword)
router.post('/verifyAndUpdatePassword',passwordController.verifyAndUpdatePassword)
router.post('/resendotp',passwordController.resendOTP)
router.get('/resetpassword',userEnsure,passwordController.showresetpassword)
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
router.get('/shoplist',verifyUser,nocache,shopController.shopList)
router.post('/shoplist',shopController.shopList)
router.get('/productdetails/:id',userController.productDetails)
router.get('/logout', verifyUser, userController.logout);







module.exports = router;
