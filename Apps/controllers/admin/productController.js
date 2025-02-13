const Product = require('../../models/productModel')
const uploads = require('../../config/multer')
const { error } = require('console')

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
            const imagePaths = req.files.map(File.filename)
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
    }

}


module.exports=productController