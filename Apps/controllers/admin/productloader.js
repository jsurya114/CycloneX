const Product = require('../../models/productModel')
const Brand = require('../../models/brandModel')
const Category = require('../../models/categoryModel')
const { default: mongoose } = require('mongoose')
const productloader ={


    showeditProduct:async (req,res) => {
        try {
            const productId = req.params.id
            if(!mongoose.Types.ObjectId.isValid(productId)){
                return res.status(400).send('invalid productid')
            }
const product = await Product.findById(productId).populate('brands','name').populate('category', 'name')
const brands = await Brand.find()
const category = await Category.find()
if(!product){
    return res.status(404).send('product not found')
}
if(!product.category){
    product.category=null
}
res.render('editproduct',{product,brands,category})
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error')
        }
    },
    editProduct:async (req,res) => {
        try {
            const {productId,productName,description,price,brands,category}=req.body
            const updateData = {productName,description,price,brands,category}
            if(req.file&&req.files.length>0){
                updateData.images=req.files.map(file=>file.filename)

            }
            await Product.findByIdAndUpdate(productId,updateData,{new:true})
            res.status(200).json({ success: true, message: 'Product updated successfully' })
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error updating product' })
        }
    },
    productsoftdelete:async (req,res) => {
        try {
const productId =req.params.id
const product = await Product.findById(productId)
if(!product) return res.status(404).json({success:false,message:'product not found'})

    product.isDeleted=!product.isDeleted
await product.save()
res.status(200).json({success:true,message:'product status updated'})
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error updating product status' })
        }
    }
}
module.exports=productloader