const Product = require('../../models/productModel')
const Brand = require('../../models/brandModel')
const Category = require('../../models/categoryModel')
const uploads = require('../../config/multer')
const category = require('../admin/categoryController')
// const { error } = require('console')
// const { addbrand, brands } = require('./adminController')
// const { text } = require('stream/consumers')
// const { type } = require('os')
const upload = require('../../config/multer')

const productController ={

    showAddProductPage: async (req,res)=>{
     try { 
        const brands = await Brand.find()
        const category = await Category.find()
       res.status(200).render('addproduct',{brands,category})}
       catch(error){
console.log(error)
res.status(500).send('internal server error')
       }
    },
    addproduct:async (req,res) => {
        console.log('invoked add prod 1');
        
        try {
           upload.array('productImage')(req,res,async function(err) {
            if(err){
                console.log('invoked add prod 2');
                console.log(err)
                return res.status(400).json({error:err.message})
            }
            console.log(req.body)
            console.log(req.files)
            const {productName,description,price,brands,category}=req.body
            if(!req.files||req.files.length===0){
                console.log('invoked add prod 3');
                return res.status(400).send('atleast one image is required')
            }
            const imagePaths = req.files.map(file=>file.filename)
console.log(imagePaths)
            const newProduct = new Product({
                productName,
                description,
                price:Number(price),
                images:imagePaths,
                brands,
                category
            })
            await newProduct.save()
            console.log('invoked add prod 4');
            res.status(201).redirect('/admin/addproduct?success=true')
           }) 
          

        } catch (error) {
            console.log('error add prod invoked');
            
            console.log(error)
            res.status(500).send('internal server error')
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
          if (!req.file) {
            return res.status(400).json({ success: false, message: 'Brand logo is required' });
          }
    
          const { name, description } = req.body;
          if (!name || !description) {
            return res.status(400).json({message:'brand name and description are required'})
          }

    
          // Check if the brand already exists
          const existingBrand = await Brand.findOne({ name });
          if (existingBrand) {
            return res.status(400).json({ success: false, message: 'Brand already exists' });
          }
          const brandLogo = `/backend/imgs/addbrand/${req.file.filename}`;
          const newBrand = new Brand({
            name,
            description,
            image: brandLogo,
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
    
    
editbrand:async (req,res)=>{
    console.log("invoked edit brand");
    
    try {
        
        const brandId = req.params.id;
        const { brandName, brandDescription } = req.body;
    
       
        if (!brandName || !brandDescription) {
          return res.status(400).json({
            success:false,
            message:'brand name and description are required'
          })
        }
    
        let brand = await Brand.findById(brandId);
        if (!brand) {
          return res.status(404).json({
            success:false,
            message:'brand not found'
          })
        }
    
        
        brand.name = brandName;
        brand.description = brandDescription;
        if (req.file) {
          brand.image = `/backend/imgs/editbrand/${req.file.filename}`;
        }
    
        await brand.save();
        res.status(200).json({
            success:true,
            message:'brand updated successfully'
        })
      } catch (error) {
        console.error(error);
        res.status(500).status(500).json({
            success:false,
            message:'error updating brand'
        })
      }
},
listing:async (req, res) => {
    try {
        const brandId = req.params.id
        const {status} = req.body
       const brand = await Brand.findById(brandId)
       if(!brand){
        return res.status(404).json({
            success:false,
            message:'brand not found'
        })
       }
       brand.isBlocked=!brand.isBlocked
       await brand.save()
       res.status(200).json({
        success:true,
          message: `Brand ${brand.isBlocked ? 'blocked' : 'unblocked'} successfully`
       })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error deleting brand"
        })
      }
},

}


module.exports=productController