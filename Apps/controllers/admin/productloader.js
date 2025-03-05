const Product = require('../../models/productModel')
const Brand = require('../../models/brandModel')
const Category = require('../../models/categoryModel')
const { default: mongoose } = require('mongoose')
const path = require('path');
const fs = require('fs');
const productloader ={


    showeditProduct:async (req,res,next) => {
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
    editProduct:async (req,res,next) => {
        try {
            const { productId, productName, description, price, brands, category, stock } = req.body;
            
            // Validation
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
            
            // Get current product data
            const existingProduct = await Product.findById(productId);
            
            // Prepare update object
            const updateData = {
                productName,
                description,
                price,
                brands,
                category,
                stock,
                
            };
            
            // Handle main image if provided
            if (req.files && req.files.mainImage && req.files.mainImage.length > 0) {
                updateData.mainImage = req.files.mainImage[0].path.replace('public/', '');
            }
            
            // Handle additional images if provided
            if (req.files && req.files.images && req.files.images.length > 0) {
                // If product already has images, append the new ones
                if (existingProduct.images && existingProduct.images.length > 0) {
                    updateData.images = [
                        ...existingProduct.images,
                        ...req.files.images.map(file => file.path.replace('public/', ''))
                    ];
                } else {
                    updateData.images = req.files.images.map(file => file.path.replace('public/', ''));
                }
            }
            
            await Product.findByIdAndUpdate(productId, updateData, { new: true });
            res.status(200).json({ success: true, message: 'Product updated successfully' });
        } catch (error) {
            console.error(error);
            next(error);
        }
    },

   deleteProductImage : async (req, res, next) => {
        try {
            const productId = req.params.id;
            const { type, image, index } = req.body;
            
            const product = await Product.findById(productId);
            
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
            
            // Handle file deletion from filesystem
            const imagePath = path.join('public', image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            
            // Update database based on image type
            if (type === 'main') {
                // Clear main image
                product.mainImage = '';
            } else if (type === 'additional') {
                // Remove specific image from array
                product.images.splice(index, 1);
            }
            
            await product.save();
            
            res.status(200).json({ success: true, message: 'Image deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Failed to delete image' });
        }
    },



    productsoftdelete:async (req,res,next) => {
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