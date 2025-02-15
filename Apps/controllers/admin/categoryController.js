const uploads = require('../../config/multer')
const Category = require('../../models/categoryModel')
   const categoryController ={ category: async  (req,res)=>{
       try {
        const category = await Category.find()
        res.render('category',{category,message:null})
       } catch (error) {
        console.error(error)
        res.status(500).send('Internal Server Error')
       }
      },
      addCategory:async (req,res) => {
        console.log('invoked add cat');
        
        try {
         
            
            const {name,slug,description} =req.body
            if(!name ||!slug||!description){
                return res.status(400).json({success:false,message:'name,slug and description are required'})

            }
            if(!req.file){
                return res.status(400).json({success:false,message:'image is required'})
            }
const existingCategory = await Category.findOne({name:name,slug:slug})
if(existingCategory){
    return res.status(400).json({success:false,message:'category already exits'})
}
            const newCategory = new Category({
                name,
                slug,
                description,
                image:req.file?`/backend/imgs/category/${req.file.filename}`:''
            })
           
            await newCategory.save()
            res.status(200).json({success:true,message:'category created successfully'})
        } catch (error) {
            console.error("Error adding category:", error)
            res.status(500).json({success:false,message:'internal server error'})
        } 
      },
      showEditCategrory:async (req,res) => {
        try {
            const categoryId = req.params.id 
         const category = await Category.findById(categoryId)
         if(!category) return res.status(404).send('Category not found')
            res.render('editcategory',{category,message:null})
    
        }catch (error) {
        console.error(error);
        res.status(500).send('Error loading edit page');
    }
      },
      editcategory:async (req,res) => {
        try {

            const categoryId = req.params.id
            const category = await Category.findById(categoryId)
            if (category.isBlocked){
                return res.status(400).json({success:false,message:'cannot edit a blocked category'})
            }
            const {name,slug,description}=req.body
            const updateData = {name ,slug , description}
            if(req.file){
                updateData.image =`/backend/imgs/category/${req.file.filename}`
            }
            await Category.findByIdAndUpdate(req.params.id,updateData)
            res.status(200).json({success:true,message:'category updated successfully'})
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Error updating category" })
        }

      },
      listing:async (req,res)=>{
        try {
          const categoryId = req.params.id 
          const category = await Category.findById(categoryId)
          if(!category){
            return res.status(404).json({
                success:false,
                message:'category not found'
            })
          }  
          category.isBlocked=!category.isBlocked
          await category.save()
          res.status(200).json({
            success:true,
            message:`Category ${category.isBlocked ? 'blocked' : 'unblocked'} successfully`
          })
        } catch (error) {
            console.error(error)
    res.status(500).json({ success: false, message: 'Error toggling category status' }) 
        }
      },
      deleteCategories:async(req,res)=>{
        try {
            const {ids} =req.body
            if(!ids||!Array.isArray(ids)||ids.length===0){
             return  res.status(400).json({success:false,message:'no categories selectd'})   
            }
            await Category.deleteMany({_id:{$in:ids}})
            res.status(200).json({success:true,message:"categories deleted successfully"})
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error deleting categories' })
        }
      }
    }
      module.exports = categoryController