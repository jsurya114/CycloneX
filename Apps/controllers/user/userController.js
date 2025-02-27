const Category = require('../../models/categoryModel')
const Brand = require('../../models/brandModel')
const Product =require('../../models/productModel')
const { category } = require('../admin/categoryController')
 

const userController = {
    home: async (req, res,next) => {
        try {
            const { search, categoryFilter, brandsFilter, sortBy ,page,limit} = req.query;
            let filter = {};
    

            const categories = await Category.find({});
            const brands = await Brand.find({});
            if (search) {
                filter.$or = [
                    { productName: { $regex: search.trim(), $options: "i" } },
                    { 'brand.name': { $regex: search.trim(), $options: "i" } },
                    { 'category.name': { $regex: search.trim(), $options: "i" } },
                ];
            }
    
            let selectedCategory = null;
            if (categoryFilter) {
                const categoryObj = await Category.findOne({ name: categoryFilter });
                if (categoryObj) {
                    filter.category = categoryObj._id;
                    selectedCategory = categoryObj;
                }
            }
    
            let selectedBrand = null;
            if (brandsFilter) {
                const brandObj = await Brand.findOne({ name: brandsFilter });
                if (brandObj) {
                    filter.brands = brandObj._id;
                    selectedBrand = brandObj;
                }
            }
    
            let sortOptions = { createdAt: -1 };
            if (sortBy) {
                switch (sortBy) {
                    case 'priceLowHigh':
                        sortOptions = { price: 1 };
                        break;
                    case 'priceHighLow':
                        sortOptions = { price: -1 };
                        break;
                    case 'aToZ':
                        sortOptions = { productName: 1 };
                        break;
                    case 'zToA':
                        sortOptions = { productName: -1 };
                        break;
                }
            }
    

            // Pagination logic
                      let currentPage = parseInt(page) || 1;
                      let itemsPerPage = parseInt(limit) || 4;
                      let skip = (currentPage - 1) * itemsPerPage;
          
                      // Count total products
                      let totalProducts = await Product.countDocuments({ ...filter, isDeleted: false });

            const product = await Product.find({ ...filter, isDeleted: false })
                .sort(sortOptions)
                .skip(skip)
                .limit(itemsPerPage)
                .populate('brands')
                .populate('category');

    // Calculate total pages
    let totalPages = Math.ceil(totalProducts / itemsPerPage);


                const breadcrumbs=[

                    {name:'Home',url:'/'}
                ]

                if(selectedCategory){
                    breadcrumbs.push({name:selectedCategory.name,
                        url:`/home?categoryFilter=${encodeURIComponent(selectedCategory.name)}`
                    })
                }
                if(selectedBrand){
                    breadcrumbs.push({name:selectedBrand.name,
                        url:`/home?brandsFilter=${encodeURIComponent(selectedBrand.name)}`
                    })
                }


                if(search){
                    breadcrumbs.push({name:`Search: "${search}"`,
                    url: `/home?search=${encodeURIComponent(search)}`})
                }
    
            res.render('home', {
                product,
                categories,
                brands,
                breadcrumbs,
                success: req.query.added === 'true',
                currentFilters: { search, categoryFilter, brandsFilter, sortBy },

                currentPage,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                prevPage: currentPage > 1 ? currentPage - 1 : null,
            });
        } catch (error) {
            console.error('Error loading home page:', error);
            next(error)
        }
    },
    productDetails:async (req, res,next) => {
        try {
            const id =req.params.id
        const product = await Product.findById(id).populate('brands').populate('category')

        const breadcrumbs = [
            { name: 'Home', url: '/' },
            { name: product.category.name, url: `/home?categoryFilter=${encodeURIComponent(product.category.name)}` },
            { name: product.brands.name, url: `/home?brandsFilter=${encodeURIComponent(product.brands.name)}` },
            { name: product.productName, url: `/productdetails/${product._id}` }
        ];


        const relatedProducts= await Product.find({
            category:product.category,
            brands:product.brands,
            _id:{$ne:product._id},
           

        }).limit(10)
   
        res.status(200).render('productdetails',{product,relatedProducts, breadcrumbs})
        
        } catch (error) {
            console.error(error)
            next(error)
        }




    },
    logout:(req, res,next)=>{
        res.clearCookie('token')
        res.status(200).redirect('/')
    }
        
    }
    module.exports=userController
