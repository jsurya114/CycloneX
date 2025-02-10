const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.get('/',userController.logins)
router.post('/',userController.loginspost)
router.get('/signup',userController.signup)
router.post('/signup',userController.createuser)
router.get('/home',userController.home)

module.exports = router