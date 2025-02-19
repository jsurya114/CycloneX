const uploads = require('../../config/multer');
const Category = require('../../models/categoryModel');

const categoryController = {
  category: async (req, res) => {
    try {
      const category = await Category.find();
      res.render('category', { category, message: null });
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
      if(!/[A-Z]/.test(name)){
        return res.status(400).json({ success: false, field: "name", message: "Name must contain at least one uppercase letter." })
            }
            if(description.length<10){
              return res.status(400).json({ success: false, field: "description", message: "Description must be at least 10 characters long." })
            }
      
   

      const existingCategory = await Category.findOne({$or:[{name},{slug}]});
   if(existingCategory) {  
      if (existingCategory.name===name) {
        return res.status(400).json({ success: false, message: 'category already exists' });
      }
      if(existingCategory.slug===slug){
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
      return res.status(400).json({success:false,field:'all',message: "All fields are required." })
     }
     if (!/[A-Z]/.test(name)) {
      return res.status(400).json({ success: false, field: "name", message: "Name must contain at least one uppercase letter." });
    }
    if (description.length < 10) {
      return res.status(400).json({ success: false, field: "description", message: "Description must be at least 10 characters long." });
    }

    // Check for duplicate category name and slug
    const existingCategory = await Category.findOne({ _id: { $ne: categoryId }, $or: [{ name }, { slug }] });
    if (existingCategory) {
      if (existingCategory.name === name) {
        return res.status(400).json({ success: false, field: "name", message: "Category name already exists." });
      }
      if (existingCategory.slug === slug) {
        return res.status(400).json({ success: false, field: "slug", message: "Slug already exists." });
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
      console.log(`Category ${category.name} is now ${category.isBlocked ? "Blocked" : "Unblocked"}`);
      res.status(200).json({
        success: true,
        message: `Category ${category.isBlocked ? 'blocked' : 'unblocked'} successfully`
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error listing category status' });
    }
  },

  deleteCategories: async (req, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'no categories selected' });
      }
      await Category.deleteMany({ _id: { $in: ids } });
      res.status(200).json({ success: true, message: "categories deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error deleting categories' });
    }
  }
};

module.exports = categoryController;
