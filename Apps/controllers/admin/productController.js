const Product = require('../../models/productModel');
const Brand = require('../../models/brandModel');
const Category = require('../../models/categoryModel');
const uploads = require('../../config/multer');
const category = require('../admin/categoryController');

const sharp = require('sharp')
const fs = require('fs')

const productController = {
quickView:async (req,res,next) => {
try {
  const product=await Product.findById(req.params.id).populate('brands').populate('category')

  if (!product) {
    return res.status(404).send('Product not found');
  }
  res.render('quickview', { product });
} catch (error) {
  console.error(err);
  res.status(500).render('500')
}
},

  showAddProductPage: async (req, res,next) => {
    try { 
      const brands = await Brand.find();
      const category = await Category.find();
      res.status(200).render('addproduct', { brands, category });
    } catch (error) {
      console.log(error);
      res.status(500).send('internal server error');
    }
  },
  addproduct: async (req, res,next) => {
    console.log('invoked add prod 1');
    try {
      let errors = {};
      const { productName, description, price, brands, category, stock } = req.body;
      
      // Validate fields
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
      
      if (!category) {
        errors.category = "Category is required.";
      }
      
      if (!brands) {
        errors.brands = "Brand is required.";
      }
      
      if (!req.files || !req.files.mainImage || req.files.mainImage.length === 0) {
        errors.mainImage = "Main image is required.";
      }
      
      if (!req.files || !req.files.images || req.files.images.length === 0) {
        errors.images = "At least one additional image is required.";
      } else if (req.files.images.length > 4) {
        errors.images = "You can upload up to 4 additional images.";
      }
      
      // Return errors if any validations failed
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, errors });
      }
      
      // Check for unique product name
      const existingProduct = await Product.findOne({ productName });
      if (existingProduct) {
        errors.productName = "A product with this name already exists.";
        return res.status(400).json({ success: false, errors });
      }
      
      // Main image is stored as-is.
      const mainImagePath = `backend/imgs/products/${req.files.mainImage[0].filename}`;
      
      // Parse crop data sent from the frontend (as JSON)
      let cropData = [];
      if (req.body.cropData) {
        try {
          cropData = JSON.parse(req.body.cropData);
        } catch (err) {
          cropData = [];
        }
      }
      
      // Process each additional image using Sharp and crop data if provided.
      for (let i = 0; i < req.files.images.length; i++) {
        const file = req.files.images[i];
        const filePath = file.path;
        const tmpFilePath = filePath + '.tmp';
        
        // Wait briefly to ensure file is fully released by Multer.
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (cropData[i]) {
          const { x, y, width, height } = cropData[i];
          await sharp(filePath)
            .extract({ 
              left: Math.round(x), 
              top: Math.round(y), 
              width: Math.round(width), 
              height: Math.round(height) 
            })
            .resize(1000, 1000, { fit: 'cover' })
            .toFile(tmpFilePath);
        } else {
          // If no crop data is provided, use a default resize.
          await sharp(filePath)
            .resize(1000, 1000, { fit: 'cover' })
            .toFile(tmpFilePath);
        }
        await fs.promises.rename(tmpFilePath, filePath);
      }
      
      // Map additional images to their relative paths.
      const imagePaths = req.files.images.map(file => `backend/imgs/products/${file.filename}`);
      
      // Create and save the new product.
      const newProduct = new Product({
        productName,
        description,
        price: Number(price),
        mainImage: mainImagePath,
        images: imagePaths,
        brands,
        category,
        stock
      });
      await newProduct.save();
      
      // Return success response.
      res.status(201).json({ success: true, message: 'product added successful' });
      
    } catch (error) {
      console.log(error);
      next(error)
    }
  },
  

  showAddBrandPage: async (req, res,next) => {
    try {
const {search,statusFilter,page,limit}=req.query
let filter={}
if(search){
  filter.$or=[
    {name:{$regex:search,$options:'i'}},
   
  ]
}
if(statusFilter==='active'){
  filter.isBlocked=false
}else if(statusFilter==='deactive'){
  filter.isBlocked=true
}

let currentPage=parseInt(page)||1
let itemsPerPage=parseInt(limit)||3
let skip = (currentPage-1)*itemsPerPage
let totalProducts =await Brand.countDocuments(filter)


let sortOptions = { createdAt: -1 };
      const brands = await Brand.find(filter).skip(skip)
      .limit(itemsPerPage).sort(sortOptions)

      let totalPages = Math.ceil(totalProducts/itemsPerPage)
      res.render('brands', { brands ,
        currentPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
    });

     
    } catch (error) {
    next(error)
    }
  },

  addBrand: async (req, res,next) => {
    try {
      // Removed image (req.file) requirement and processing
      
      const { name, description } = req.body;

      // Trim input to remove extra spaces
      const trimmedName = name.trim();
      const trimmedDescription = description.trim();

      // Validate brand name
      if (!trimmedName) {
        return res.status(400).json({ success: false, message: 'Brand name is required' });
      }

       // Validate that brand name contains at least one uppercase letter
    if (!/[A-Z]/.test(trimmedName)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Brand name must contain at least one uppercase letter' 
      });
    }

      // Check if brand name already exists (case insensitive)
      const existingBrand = await Brand.findOne({ name: { $regex: `^${trimmedName}$`, $options: 'i' } });
      if (existingBrand) {
        return res.status(400).json({ success: false, message: 'Brand already exists' });
      }

      // Validate description
      if (!trimmedDescription || trimmedDescription.length < 10) {
        return res.status(400).json({ success: false, message: 'Brand description must be at least 10 characters long' });
      }

      // Save the brand without an image field
      const newBrand = new Brand({
        name: trimmedName,
        description: trimmedDescription,
      });

      await newBrand.save();
      res.status(201).json({ success: true, message: 'Brand added successfully' });

    } catch (error) {
      console.error(error);
      next(error)
    }
  },

  showEditBrandPage: async (req, res,next) => {
    try {

      
      const brandId = req.params.id;
      const brand = await Brand.findById(brandId);

      if (!brand) {
        return res.status(404).redirect('/admin/brands');
      }

      res.status(200).render('editbrand', { brand, message: null });
    } catch (error) {
      console.error(error);
      next(error)
    }
  },

  editbrand: async (req, res,next) => {

    try {
      const brandId = req.params.id;
      const { name, description } = req.body;
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: 'Brand name and description are required'
        });
      }

      let brand = await Brand.findById(brandId);
      if (!brand) {
        return res.render('404',{message:"Brand  not found"})
      }

      // Update name and description only (removed image update)
      brand.name = name;
      brand.description = description;

      await brand.save();
      res.status(200).json({
        success: true,
        message: 'Brand updated successfully'
      });
    } catch (error) {
      console.error(error);
     next(error);
    }
  },

  listing: async (req, res,next) => {
    try {
      const brandId = req.params.id;
      const { status } = req.body;
      const brand = await Brand.findById(brandId);
      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }
      brand.isBlocked = !brand.isBlocked;
      await brand.save();
      res.status(200).json({
        success: true,
        message: `Brand ${brand.isBlocked ? 'blocked' : 'unblocked'} successfully`
      });
    } catch (error) {
      console.error(error);
      next(error)
    }
  },
};

module.exports = productController;
