const Product = require('../../models/productModel');
const Brand = require('../../models/brandModel');
const Category = require('../../models/categoryModel');
const uploads = require('../../config/multer');
const category = require('../admin/categoryController');

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
      // Extract form data
      const { productName, description, price, brands, category } = req.body;
      const images = req.processedFiles || [];

      if (!productName || !description || !price || !brands || !category) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      // Validate the number of uploaded images
      if (!req.files || req.files.length === 0 || req.files.length > 4) {
        console.log('invoked add prod 3');
        return res.status(400).send('At least one image is required');
      }

      // Map uploaded files to their paths
      const imagePaths = req.files.map(file => `backend/imgs/products/${file.filename}`);
      console.log(imagePaths);
      const newProduct = new Product({
        productName,
        description,
        price: Number(price),
        images,
        brands,
        category
      });
      await newProduct.save();
      console.log('invoked add prod 4');

      // Redirect to the addproduct page with a success message
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
