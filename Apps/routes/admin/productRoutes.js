const express = require('express')
const router =express.Router()
const productController = require('../../controllers/admin/productController')
router.get('/addproduct',productController.showAddProductPage)
router.post('/addproduct',productController.addproduct)
module.exports=router