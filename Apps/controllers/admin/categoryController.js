const { name } = require('ejs');
const uploads = require('../../config/multer');
const Category = require('../../models/categoryModel');
const Offer = require('../../models/offerModel')
const categoryController = {
  category: async (req,res,next) => {
    try {
        const { search,  statusFilter ,page,limit} = req.query;

        let filter = {};

        // Search functionality
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
               
            ];
        }

        // Filter by status
        if (statusFilter === "active") {
            filter.isBlocked = false;
        } else if (statusFilter === "deactive") {
            filter.isBlocked = true;
        }


let currentPage=parseInt(page)||1
let itemsPerPage = parseInt(limit)||3
let skip=(currentPage-1)*itemsPerPage
let totalProducts =await Category.countDocuments(filter)


 
let sortOptions = { createdAt: -1 };
        const category = await Category.find(filter).skip(skip)
        .limit(itemsPerPage).sort(sortOptions)

        let totalPages =Math.ceil(totalProducts/itemsPerPage)
        
        res.render('category', { category, message: null ,
          search,             // Add this
    statusFilter,
          currentPage,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                prevPage: currentPage > 1 ? currentPage - 1 : null,
        });
    } catch (error) {
        console.error(error);
        next(error)
    }
},

addCategory: async (req, res, next) => {
  try {
    console.log('Request Body:', req.body);
    const { name, slug, description, offer } = req.body;

    if (!name || !slug || !description || offer === undefined || offer === null || offer === "") {
      return res.status(400).json({
        success: false,
        field: 'all',
        message: "All fields are required."
      });
    }
   
    if (!/[A-Z]/.test(name) || /\d/.test(name)) {
      return res.status(400).json({
        success: false,
        field: "name",
        message: "Name must contain at least one uppercase letter and cannot contain numbers."
      });
    }
    
    if (/^\d+$/.test(slug)) {
      return res.status(400).json({
        success: false,
        field: 'slug',
        message: 'Category slug cannot consist of only numbers.'
      });
    }
    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        field: "description",
        message: "Description must be at least 10 characters long."
      });
    }

    if (/^\d+$/.test(description.trim())) {
      return res.status(400).json({
        success: false,
        field: 'description',
        message: 'Category description cannot consist of only numbers.'
      });
    }
    if (description.trim() === '') {
      return res.status(400).json({
        success: false,
        field: 'description',
        message: 'Category description cannot be empty or contain only spaces.'
      });
    }

  // Offer validation
  const numericOffer = Number(offer);
  if (isNaN(numericOffer) || numericOffer < 0 || numericOffer > 85) {
    return res.status(400).json({
      success: false,
      field: 'offer',
      message: "Offer must be a number between 0 and 85."
    });
  }
  if (numericOffer === 0) {
    return res.status(400).json({
      success: false,
      field: 'offer',
      message: 'Offer cannot be zero.'
    });
  }






    // Check if category already exists (case insensitive)
    const existingCategory = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { slug: { $regex: new RegExp(`^${slug}$`, 'i') } }
      ]
    });

    if (existingCategory) {
      if (existingCategory.name.toLowerCase() === name.toLowerCase()) {
        return res.status(400).json({
          success: false,
          field: 'name',
          message: 'Category already exists.'
        });
      }

      if (existingCategory.slug.toLowerCase() === slug.toLowerCase()) {
        return res.status(400).json({
          success: false,
          field: 'slug',
          message: 'Slug already exists.'
        });
      }
    }

    // Save new category
    const newCategory = new Category({
      name,
      slug,
      description,
      offer: numericOffer
    });

    await newCategory.save();
    res.status(200).json({
      success: true,
      message: 'Category created successfully.'
    });

  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
,

  showEditCategrory: async (req,res,next) => {
    try {
      const categoryId = req.params.id;
      const category = await Category.findById(categoryId);
      if (!category) return res.status(404).send('Category not found');
      res.render('editcategory', { category, message: null });
    } catch (error) {
      console.error(error);
      next(error)
    }
  },

  editcategory: async (req,res,next) => {
    try {
      console.log('invoked')
    console.log('req.body',req.body)
     const {name,slug,description,offer} =req.body
 
     const categoryId =req.params.id
     if (!name || !slug || !description || offer === undefined || offer === null || offer === "") {
      return res.status(400).json({
        success: false,
        field: 'all',
        message: "All fields are required."
      });
    }
   
    if (!/[A-Z]/.test(name) || /\d/.test(name)) {
      return res.status(400).json({
        success: false,
        field: "name",
        message: "Name must contain at least one uppercase letter and cannot contain numbers."
      });
    }
    
    if (/^\d+$/.test(slug)) {
      return res.status(400).json({
        success: false,
        field: 'slug',
        message: 'Category slug cannot consist of only numbers.'
      });
    }
    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        field: "description",
        message: "Description must be at least 10 characters long."
      });
    }

    if (/^\d+$/.test(description.trim())) {
      return res.status(400).json({
        success: false,
        field: 'description',
        message: 'Category description cannot consist of only numbers.'
      });
    }
    if (description.trim() === '') {
      return res.status(400).json({
        success: false,
        field: 'description',
        message: 'Category description cannot be empty or contain only spaces.'
      });
    }

  // Offer validation
  const numericOffer = Number(offer);
  if (isNaN(numericOffer) || numericOffer < 0 || numericOffer > 85) {
    return res.status(400).json({
      success: false,
      field: 'offer',
      message: "Offer must be a number between 0 and 85."
    });
  }
  if (numericOffer === 0) {
    return res.status(400).json({
      success: false,
      field: 'offer',
      message: 'Offer cannot be zero.'
    });
  }





    // Check for duplicate category name and slug
    // Check for duplicate category name or slug (excluding the current category)
    const existingCategory = await Category.findOne({
      _id: { $ne: categoryId },
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { slug: { $regex: new RegExp(`^${slug}$`, 'i') } }
      ]
    });
    if (existingCategory) {
      if (existingCategory.name.toLowerCase() === name.toLowerCase()) {
        return res.status(400).json({
          success: false,
          field: 'name',
          message: 'Category name already exists.'
        });
      }
      if (existingCategory.slug.toLowerCase() === slug.toLowerCase()) {
        return res.status(400).json({
          success: false,
          field: 'slug',
          message: 'Slug already exists.'
        });
      }
    }

    await Category.findByIdAndUpdate(categoryId, { name, slug, description ,offer:numericOffer});
    res.status(200).json({ success: true, message: "Category updated successfully" });

    } catch (error) {
      console.error('Error updating category:',error);
      next(error)
    }
  },

  listing: async (req,res,next) => {
    try {
      const categoryId = req.params.id;
    
      const category = await Category.findById(categoryId);
      if (!category) {
        console.error(categoryId);
        return res.status(404).json({
          success: false,
          message: 'category not found'
        });
      }
      category.isBlocked = !category.isBlocked;
      await category.save();
      res.status(200).json({
        success: true,
        message: `Category ${category.isBlocked ? 'deactivated' : 'activated'} successfully`
      });
    } catch (error) {
      console.error(error);
      next(error)
    }
  },


};

module.exports = categoryController;
