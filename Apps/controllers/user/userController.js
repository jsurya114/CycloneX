const Category = require('../../models/categoryModel')
const Brand = require('../../models/brandModel')
const Product =require('../../models/productModel')
 

const userController = {
    home: async (req, res) => {
        console.log('invoked home');

        try {
            const product = await Product.find({isDeleted:false}).sort({_id:-1})
            .limit(4).populate('brands').populate('category')
            console.log(product)
            
            const bannerProducts = await Product.find({isDeleted:false}).sort({price:1}).limit(2)
            res.render('home', {
                logoPath: '/frontend/imgs/logos/cyclonelogo.png',
                sliderImages:[
                    '/frontend/imgs/slider/slider-1.jpg',
                  '/frontend/imgs/slider/slider-2.jpg'

                ],
                bannerImages:[
                     bannerProducts[0]?.Image || '/frontend/imgs/banner/slider.jpg',
                bannerProducts[1]?.Image || '/frontend/imgs/banner/slider2.png'
                ],
                product

            });

        } catch (error) {
            console.error('Error loading home page:', err);
            res.render('home', {
                logoPath: '/frontend/imgs/logos/cyclonelogo.png',
                sliderImages: [
                    '/frontend/imgs/slider/slider-4.png', 
                    '/frontend/imgs/slider/slider-5.png'
                ],
                bannerImages: [
                    '/frontend/imgs/banner/slider.jpg',
                    '/frontend/imgs/banner/slider2.png'
                ]
            });
        }
        
      
    },
    productDetails:async (req,res) => {
        try {
            const id =req.params.id
        const product = await Product.findById(id).populate('brands').populate('category')

        const relatedProducts= await Product.find({
            category:product.category,
            _id:{$ne:product._id}

        }).limit(10)
        res.status(200).render('productdetails',{product,relatedProducts})
        
        } catch (error) {
            console.error(error)
            res.status(500).send('internal server error')
        }




    },
    logout:(req,res)=>{
        res.clearCookie('token')
        res.status(200).redirect('/')
    }
        
    }
    module.exports=userController
