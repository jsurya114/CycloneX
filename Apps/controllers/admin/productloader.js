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
            let sortOptions = { createdAt: -1 };
const product = await Product.findById(productId).populate('brands','name').populate('category', 'name').sort(sortOptions)
const brands = await Brand.find()
const category = await Category.find()
if(!product){
    return res.status(404).json({success:true,message:'product not found'})
}
if(!product.category){
    product.category=null
}
res.render('editproduct',{product,brands,category})
        } catch (error) {
            console.error(error);
        next(error)
        }
    },
    editProduct:async (req,res) => {
        try {
            const {productId,productName,description,price,brands,category,stock}=req.body
            let errors = {};

            if (!productName) {
                errors.productName = "Product Name is required.";
              } else if (!/[A-Z]/.test(productName)) {
                errors.productName = "Product Name must contain at least one uppercase letter.";
              }

              if (!description) {
                errors.description = "Description is required.";
              } else if (description.trim().length < 10) {
                errors.description = "Description must be at least 10 characters long.";
              }

              if (!price) {
                errors.price = "Price is required.";
              } else if (isNaN(price) || Number(price) <= 0) {
                errors.price = "Price must be a positive number.";
              }
              if (Object.keys(errors).length > 0) {
                return res.status(400).json({ success: false, errors });
            }

            const updateData = {productName,description,price,brands,category,stock}
            if(req.file&&req.files.length>0){
                updateData.images=req.files.map(file=>file.filename)

            }
            await Product.findByIdAndUpdate(productId,updateData,{new:true})
            res.status(200).json({ success: true, message: 'Product updated successfully' })
        } catch (error) {
            console.error(error);
            next(error)
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
            next(error)
        }
    }
}
module.exports=productloader