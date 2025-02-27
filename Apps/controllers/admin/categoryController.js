const uploads = require('../../config/multer');
const Category = require('../../models/categoryModel');

const categoryController = {
  category: async (req, res) => {
    try {
        const { search,  statusFilter ,page,limit} = req.query;

        let filter = {};

        // Search functionality
        if (search) {
            filter.$or = [
                { category: { $regex: search, $options: 'i' } },
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


 

        const category = await Category.find(filter).skip(skip)
        .limit(itemsPerPage)

        let totalPages =Math.ceil(totalProducts/itemsPerPage)
        
        res.render('category', { category, message: null ,
          currentPage,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                prevPage: currentPage > 1 ? currentPage - 1 : null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
},

  addCategory: async (req, res) => {
    console.log('invoked add cat');
    try {
      const { name, slug, description } = req.body;
      //validation
      if (!name || !slug || !description) {
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
      
   

      const existingCategory = await Category.findOne({$or:[{name:{$regex:new RegExp(`^${name}$`,'i')}},{slug:{$regex:new RegExp(`^${slug}$`,'i')}}]});
   if(existingCategory) {  
      if (existingCategory.name.toLowerCase()===name.toLowerCase()) {
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
       
      });

      await newCategory.save();
      res.status(200).json({ success: true, message: 'category created successfully' });
    } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).json({ success: false, field: "all", message: "Internal Server Error" })
    }
  },

  showEditCategrory: async (req, res) => {
    try {
      const categoryId = req.params.id;
      const category = await Category.findById(categoryId);
      if (!category) return res.status(404).send('Category not found');
      res.render('editcategory', { category, message: null });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading edit page');
    }
  },

  editcategory: async (req, res) => {
    try {
     const {name,slug,description} =req.body
     const categoryId =req.params.id
     if(!name||!slug||!description){
      return res.status(400).json({success:false,
        field:'all',
        message: "All fields are required." })
     }
    //  if (!/[A-Za-z]\s]+$/.test(name)) {
    //   return res.status(400).json({ success: false,
    //      field: "name", 
    //      message: "Name must contain at least one uppercase letter." });
    // }

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

    await Category.findByIdAndUpdate(categoryId, { name, slug, description });
    res.status(200).json({ success: true, message: "Category updated successfully" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, field: "all", message: "Internal Server Error" })
    }
  },

  listing: async (req, res) => {
    try {
      const categoryId = req.params.id;
      console.log(categoryId);
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
      console.log(`Category ${category.name} is now ${category.isBlocked ? "deactivated" : "activated"} successfully`);
      res.status(200).json({
        success: true,
        message: `Category ${category.isBlocked ? 'deactivated' : 'activated'} successfully`
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error listing category status' });
    }
  },


};

module.exports = categoryController;
