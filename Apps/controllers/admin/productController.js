const Product = require('../../models/productModel')
const Brand = require('../../models/brandModel')
const uploads = require('../../config/multer')
const category = require('./categoryController')
const { error } = require('console')
const { addbrand, brands } = require('./adminController')
const { text } = require('stream/consumers')
const { type } = require('os')

const productController ={
    showAddProductPage: async (req,res)=>{
        res.status(200).render('addproduct')
    },
    addproduct:async (req,res) => {
        try {
           uploads(req,res,async function(err) {
            if(err){
                return res.status(400).json({error:err.message})
            }
            const {productName,description,price,brands,offer,category}=req.body
            if(!req.files||req.files.length===0){
                return res.status(400).send('atleast one image is required')
            }
            const imagePaths = req.files.map(file.filename)
            const newProduct = new Product({
                productName,
                description,
                price,
                images:imagePaths,
                brands,
                offer,
                category
            })
            await newProduct.save()
            res.status(201).send(`${newProduct} is added successfully`)
           }) 
          

        } catch (error) {
            res.status(500).send('internal server error')
        }
    },


    showAddBrandPage: async (req, res) => {
        try {
            const brands=await Brand.find();
            res.render('brands',{brands}); 
        } catch (error) {
            res.status(500).send('Internal server error');
        }
    },

    addBrand:async (req,res) => {
        try {
            if(!req.file){
                return res.status(400).render('addbrand',{message:'brand logo is required'})
            }
            const {brandName,brandDescription}=req.body
            const brandLogo = `/backend/imgs/addbrand/${req.file.filename}`;
            const existingBrand = await Brand.findOne({ name: brandName });
            if (existingBrand) {
                return res.status(400).render('addbrand', { message: 'Brand already exists' });
            }
            const newBrand = new Brand({
                name:brandName,
                description:brandDescription,
                image:brandLogo
            })
            await newBrand.save()
            res.status(201).render('addbrand',{message:'Brand added succesfulyy'})
        } catch (error) {
            console.error(error);
            res.status(500).render("addbrand",{message:'internal server eroor'})
        }
},
showEditBrandPage:async (req,res)=>{

try {
    const brandId =req.params.id 
    const brand = await Brand.findById(brandId)
    if(!brand){
        return res.status(404).redirect('/admin/brands')
    }
    res.status(201).render('editbrand',{brand,message:null})
} catch (error) {
    console.error(error);
    resres.status(500).redirect('/admin/brands');
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
deletebrand:async (req, res) => {
    try {
        const brandId = req.params.id
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