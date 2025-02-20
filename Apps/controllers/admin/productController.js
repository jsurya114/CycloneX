const Product = require('../../models/productModel');
const Brand = require('../../models/brandModel');
const Category = require('../../models/categoryModel');
const uploads = require('../../config/multer');
const category = require('../admin/categoryController');
const { buffer } = require('stream/consumers');
const sharp = require('sharp')
const fs = require('fs')

const productController = {
  showAddProductPage: async (req, res) => {
    try { 
      const brands = await Brand.find();
      const category = await Category.find();
      res.status(200).render('addproduct', { brands, category });
    } catch (error) {
      console.log(error);
      res.status(500).send('internal server error');
    }
  },
  addproduct: async (req, res) => {
    console.log('invoked add prod 1');
    try {
      let errors = {};
      const { productName, description, price, brands, category, stock } = req.body;
      
      // Validate each field
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

      // Process each additional image using Sharp.
      // We write the processed image to a temporary file, then rename it back.
      for (const file of req.files.images) {
        const filePath = file.path;
        const tmpFilePath = filePath + '.tmp';
        console.log("Processing additional image:", filePath);
        // Wait briefly to ensure the file is fully released by Multer.
        await new Promise(resolve => setTimeout(resolve, 100));
        await sharp(filePath)
          .resize(1000, 1000, { fit: 'cover' })
          .toFile(tmpFilePath);
        await fs.promises.rename(tmpFilePath, filePath);
      }

      // Map additional images to their relative paths.
      const imagePaths = req.files.images.map(file => `backend/imgs/products/${file.filename}`);
      console.log("Additional Images:", imagePaths);
      console.log("Main Image:", mainImagePath);

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
      console.log('invoked add prod 4');

      // Redirect with a success message.
      res.status(201).redirect('/admin/addproduct?success=true');

    } catch (error) {
      console.log('error add prod invoked');
      console.log(error);
      res.status(500).send('internal server error');
    }
  },

  showAddBrandPage: async (req, res) => {
    try {
      const brands = await Brand.find();
      res.render('brands', { brands });
    } catch (error) {
      res.status(500).send('Internal server error');
    }
  },

  addBrand: async (req, res) => {
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
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  showEditBrandPage: async (req, res) => {
    try {
      const brandId = req.params.id;
      const brand = await Brand.findById(brandId);

      if (!brand) {
        return res.status(404).redirect('/admin/brands');
      }

      res.status(200).render('editbrand', { brand, message: null });
    } catch (error) {
      console.error(error);
      res.status(500).redirect('/admin/brands');
    }
  },

  editbrand: async (req, res) => {
    console.log("invoked edit brand");
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
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
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
      res.status(500).json({
        success: false,
        message: 'Error updating brand'
      });
    }
  },

  listing: async (req, res) => {
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
      res.status(500).json({
        success: false,
        message: "Error updating brand status"
      });
    }
  },
};

module.exports = productController;
