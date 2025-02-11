const express = require('express')
const router = express.Router()
const authController = require('../controllers/user/authController')

router.get('/',authController.logins)
router.post('/',authController.loginspost)
router.get('/signup',authController.signup)
router.post('/signup', authController.createUser);
router.post('/verify-otp', authController.verifyOtp);
router.get('/home',authController.home)

module.exports = router