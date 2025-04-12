const Product = require('../../models/productModel');
const Brand = require('../../models/brandModel');
const Category = require('../../models/categoryModel');
const uploads = require('../../config/multer');
const category = require('../admin/categoryController');

const brandController ={
  showBrandPage: async (req, res,next) => {
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
        search,
        statusFilter,
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

      if (name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Brand name cannot be empty or contain only spaces'
        });
      }
      if (/^\d+$/.test(description)) {
        return res.status(400).json({
          success: false,
          message: 'Brand description cannot consist of only numbers'
        });
      }

      if (description.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Brand description cannot be empty or contain only spaces'
        });
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
      if (name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Brand name cannot be empty or contain only spaces'
        });
      }
      if (/^\d+$/.test(description)) {
        return res.status(400).json({
          success: false,
          message: 'Brand description cannot consist of only numbers'
        });
      }

      if (description.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Brand description cannot be empty or contain only spaces'
        });
      }
      // Validation: brand name must contain at least one uppercase letter
if (!/[A-Z]/.test(name)) {
  return res.status(400).json({
    success: false,
    message: 'Brand name must contain at least one uppercase letter'
  });
}


      await Brand.findByIdAndUpdate(brandId,{name,description})
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
}

module.exports=brandController