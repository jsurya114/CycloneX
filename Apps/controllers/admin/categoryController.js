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

  addCategory: async (req,res,next) => {
    try {
      const { name, slug, description, offer} = req.body;
      //validation
      if (!name || !slug || !description||Number(offer)===undefined||Number(offer)===null) {
        return res.status(400).json({ success: false, field:'all', message: "All fields are required."  });
      }
      if(!/[A-Za-z\s]/.test(name)){
        return res.status(400).json({ success: false, field: "name", message: "Name must contain at least one uppercase letter." })
            }
if(!/^[a-z0-9]+$/.test(slug)){
  return res.status(400).json({success:false,field:'slug',message:"Slug must contain only lowercase letters, numbers, and hyphens"})
}

            if(description.length<10){
              return res.status(400).json({ success: false, field: "description", message: "Description must be at least 10 characters long." })
            }
      
            if (isNaN(Number(offer)) || Number(offer) < 0 || Number(offer) > 85) {
              return res.status(400).json({ success: false, field: 'offer', message: "Offer must be between 0 and 85." });
          }

          if(Number(offer)===0){
            return res.status(400).json({success:false,field:'offer',message:'offer cannot be zero'})
          }

          if (/^\d+$/.test(slug)) {
            return res.status(400).json({
              success: false,
              message: 'Category description cannot consist of only numbers'
            });
          }
          
          if (/^\d+$/.test(description)) {
            return res.status(400).json({
              success: false,
              message: 'Category description cannot consist of only numbers'
            });
          }
          
          if (description.trim() === '') {
            return res.status(400).json({
              success: false,
              message: 'Category description cannot be empty or contain only spaces'
            });
          }
      const existingCategory = await Category.findOne({$or:[{name:{$regex:new RegExp(`^${name}$`,'i')}},{slug:{$regex:new RegExp(`^${slug}$`,'i')}}]});
   if(existingCategory) {  
      if (existingCategory.name.toLowerCase() === name.toLowerCase()) {
        return res.status(400).json({ success: false, message: 'category already exists' });
      }
      if(existingCategory.slug.toLowerCase()===slug.toLowerCase()){
        return res.status(400).json({ success: false, field: "slug", message: "Slug already exists." });
      
      }
}
      const newCategory = new Category({
        name,
        slug,
        description,
       offer
      });

      await newCategory.save();
      res.status(200).json({ success: true, message: 'category created successfully' });
    } catch (error) {
      console.error("Error adding category:", error);
      next(error)
    }
  },

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
    
     const {name,slug,description,offer} =req.body
 
     const categoryId =req.params.id
     if(!name||!slug||!description||Number(offer)===undefined||Number(offer)===null){
      return res.status(400).json({success:false,
        field:'all',
        message: "All fields are required." })
     }
   
     if(!/[A-Za-z\s]/.test(name)){
      return res.status(400).json({ success: false, field: "name", message: "Name must contain at least one uppercase letter and connot contain number." })
          }
    
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ success: false, 
        field: 'slug', 
        message: 'Slug must contain only lowercase letters, numbers, and hyphens.' });
    }
    if (description.length < 10) {
      return res.status(400).json({ success: false, 
        field: "description", 
        message: "Description must be at least 10 characters long." });
    }


    if (isNaN(Number(offer)) || Number(offer) < 0 || Number(offer) > 85) {
      return res.status(400).json({ success: false, field: 'offer', message: "Offer must be between 0 and 85." });
  }
if(Number(offer)===0){
  return res.status(200).json({success:false,field:'offer',message:'offer cannot be zero'})
}

if (/^\d+$/.test(slug)) {
  return res.status(400).json({
    success: false,
    message: 'Category Slug cannot consist of only numbers'
  });
}

if (/^\d+$/.test(description)) {
  return res.status(400).json({
    success: false,
    message: 'Category description cannot consist of only numbers'
  });
}

if (description.trim() === '') {
  return res.status(400).json({
    success: false,
    message: 'Category description cannot be empty or contain only spaces'
  });
}

    // Check for duplicate category name and slug
    const existingCategory = await Category.findOne({ _id: { $ne: categoryId }, $or: [{ name: { $regex: new RegExp(`^${name}$`, 'i') } }, // Case-insensitive match
      { slug: { $regex: new RegExp(`^${slug}$`, 'i') } }] });
    if (existingCategory) {
      if (existingCategory.name.toLowerCase() === name.toLowerCase()) {
        return res.status(400).json({ success: false, field: 'name', message: 'Category name already exists.' });
      }
      if (existingCategory.slug.toLowerCase() === slug.toLowerCase()) {
        return res.status(400).json({ success: false, field: 'slug', message: 'Slug already exists.' });
      }
    
    }

    await Category.findByIdAndUpdate(categoryId, { name, slug, description ,offer});
    res.status(200).json({ success: true, message: "Category updated successfully" });

    } catch (error) {
      console.error(error);
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
