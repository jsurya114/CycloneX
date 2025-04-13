const Category = require('../../models/categoryModel');
const Brand = require('../../models/brandModel');
const Product = require('../../models/productModel');
const Cart = require('../../models/cartModel')
const jwt = require('jsonwebtoken')
const User = require('../../models/userModel')
const Order = require('../../models/orderModel')
const Wishlist=require("../../models/wislistModel")
const Coupon =require('../../models/couponModel')
const shopController = {

 home: async (req, res,next) => {
        try {
            const { search, categoryFilter, brandsFilter, sortBy ,page} = req.query;
            let filter = {};
             const token = req.cookies.token
             const decoded=jwt.verify(token,process.env.JWT_SECRET)

             const userId= decoded.id;
             const user=await User.findById(userId);
          let cartfind = await Cart.findOne({user: userId})
                   const cartCount = cartfind?.items.length
             let orderCount=await Order.countDocuments({user:userId})
            const categories = await Category.find({});
            const brands = await Brand.find({});
            if (search) {
                filter.$or = [
                    { productName: { $regex: search.trim(), $options: "i" } },
                    { brands: { $regex: search.trim(), $options: "i" } },
                    { category: { $regex: search.trim(), $options: "i" } },
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
    
            let sortOptions = { maxOffer:-1,createdAt: -1 };
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
                let limit=10
                      let skip =0;
          
                      // Count total products
                      let totalProducts = await Product.countDocuments({ ...filter, isDeleted: false });

            const product = await Product.find({ ...filter, isDeleted: false })
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .populate({ path: 'brands', select: 'name' }) // Ensure only needed fields are populated
                .populate({ path: 'category',select:'offer' }) 


                const productWithoffer = product.map(p=>{
                    const productOffer = p.offer||0
                  const categoryOffer = (p.category && p.category.offer) ? p.category.offer : 0;
                    const maxOffer = Math.max(productOffer,categoryOffer)
                
                    const salePrice = maxOffer>0?p.price*(1-maxOffer/100):p.price
                
                
                
                     // Return a new object with additional properties for view rendering
                    return {...p.toObject(),maxOffer,salePrice}
                })
                


        const coupon = await Coupon.findOne({isBlocked:false,expireDate:{$gt:new Date}})

    // Calculate total pages
    let totalPages = Math.ceil(totalProducts / limit);


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
    

                // Filter out products with null category or brand
const filteredProducts = product.filter(pro => pro.category && pro.brands)
            res.render('home', {
                user,
cartCount,

                product: productWithoffer, 
                categories,
                filteredProducts,
                brands,
                breadcrumbs,
                success: req.query.added === 'true',
                currentFilters: { search, categoryFilter, brandsFilter, sortBy },
                coupon,
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






    shopList: async (req, res, next) => {
        try {
            const token = req.cookies.token;
            let userId = null;
            let user = null;
            let cartCount = 0;
            let cart = null;
    
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
                user = await User.findById(userId);
    
                let cartfind = await Cart.findOne({ user: userId });
                cartCount = cartfind ? cartfind.items.length : 0;
    
                cart = await Cart.findOne({ user: userId }).populate('items.product');
            }
    
            const { search, categoryFilter, brandsFilter, sortBy, page, limit, maxPrice, minPrice } = req.query;
    
            let filter = { isDeleted: false };
    
            const categories = await Category.find({ isBlocked: false });
            const brands = await Brand.find({ isBlocked: false });
    
            // Search filter
            if (search) {
                filter.$or = [
                    { productName: { $regex: search.trim(), $options: "i" } },
                    { 'brands.name': { $regex: search.trim(), $options: "i" } },
                    { 'category.name': { $regex: search.trim(), $options: "i" } },
                ];
            }
    
            // Category filter
            if (categoryFilter) {
                const categoryObj = await Category.findOne({ name: categoryFilter });
                if (categoryObj) {
                    filter.category = categoryObj._id;
                }
            }
    
            // Brand filter
            if (brandsFilter) {
                const brandObj = await Brand.findOne({ name: brandsFilter });
                if (brandObj) {
                    filter.brands = brandObj._id;
                }
            }
    
            // Pagination setup
            let currentPage = parseInt(page) || 1;
            let itemsPerPage = parseInt(limit) || 12;
            let skip = (currentPage - 1) * itemsPerPage;
    
            // Sorting logic
            let sortOptions = { createdAt: -1 };
            let needCustomSort = false;
    
            if (sortBy) {
                switch (sortBy) {
                    case 'priceLowHigh':
                    case 'priceHighLow':
                        needCustomSort = true;
                        break;
                    case 'aToZ':
                        sortOptions = { productName: 1 };
                        break;
                    case 'zToA':
                        sortOptions = { productName: -1 };
                        break;
                    case 'newest':
                        sortOptions = { createdAt: -1 };
                        break;
                }
            }
    
            // Fetch products
            const allProducts = await Product.find(filter)
                .sort(needCustomSort ? {} : sortOptions)
                .populate('brands')
                .populate('category');
    
            // Calculate offers and sale prices
            const productsWithOffers = allProducts.map(p => {
                const productOffer = p.offer || 0;
                const categoryOffer = (p.category && p.category.offer) ? p.category.offer : 0;
                const maxOffer = Math.max(productOffer, categoryOffer);
                const salePrice = maxOffer > 0 ? p.price * (1 - maxOffer / 100) : p.price;
    
                return {
                    ...p.toObject(),
                    maxOffer,
                    salePrice
                };
            });
    
            // Apply price filter
            let filteredProducts = productsWithOffers;
    
            if (minPrice || maxPrice) {
                filteredProducts = productsWithOffers.filter(product => {
                    if (minPrice && maxPrice) {
                        return product.salePrice >= parseInt(minPrice) && product.salePrice <= parseInt(maxPrice);
                    } else if (minPrice) {
                        return product.salePrice >= parseInt(minPrice);
                    } else if (maxPrice) {
                        return product.salePrice <= parseInt(maxPrice);
                    }
                    return true;
                });
            }
    
            // Custom sort (after calculating salePrice)
            if (needCustomSort) {
                if (sortBy === 'priceLowHigh') {
                    filteredProducts.sort((a, b) => a.salePrice - b.salePrice);
                } else if (sortBy === 'priceHighLow') {
                    filteredProducts.sort((a, b) => b.salePrice - a.salePrice);
                }
            }
    
            // Pagination
            const totalProducts = filteredProducts.length;
            const productWithoffer = filteredProducts.slice(skip, skip + itemsPerPage);
            const totalPages = Math.ceil(totalProducts / itemsPerPage);
    
            // Breadcrumbs
            let breadcrumbs = [
                { name: 'Home', url: '/' },
                { name: 'Shop', url: '/shoplist' }
            ];
    
            if (categoryFilter) {
                breadcrumbs.push({
                    name: categoryFilter,
                    url: `/shoplist?categoryFilter=${encodeURIComponent(categoryFilter)}`
                });
            }
    
            if (brandsFilter) {
                breadcrumbs.push({
                    name: brandsFilter,
                    url: `/shoplist?brandsFilter=${encodeURIComponent(brandsFilter)}`
                });
            }
    
            res.render('shoplist', {
                cart,
                cartCount,
                user,
                product: productWithoffer,
                categories,
                brands,
                breadcrumbs,
                success: req.query.added === 'true',
                currentFilters: { search, categoryFilter, brandsFilter, sortBy, maxPrice, minPrice },
                currentPage,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                prevPage: currentPage > 1 ? currentPage - 1 : null,
            });
        } catch (error) {
            console.error('Error loading shop page:', error);
            next(error);
        }
    },
    
  
   
};

module.exports = shopController;
