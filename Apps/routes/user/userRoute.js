const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user/authController');
const passport = require('passport');
require('../../config/passport');
const verifyUser= require('../../middlewares/userAuth')



router.get('/', authController.logins);
router.post('/', authController.loginspost);
router.get('/signup', authController.signup);
router.post('/signup', authController.createUser);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
// Google authentication routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/home');
});
router.get('/home', verifyUser,authController.home);



module.exports = router;