const Product = require('../../models/productModel')
const Brand = require('../../models/brandModel')
const uploads = require('../../config/multer')
const { error } = require('console')
const { addbrand, brands } = require('./adminController')

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
            const brandLogo = `/backend/imgs/${req.file.filename}`;
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
}
}


module.exports=productController