const Category = require('../../models/categoryModel');
const Brand = require('../../models/brandModel');
const Product = require('../../models/productModel');
const jwt = require('jsonwebtoken')
const User = require('../../models/userModel')
const shopController = {
    shopList: async (req, res, next) => {
        try {
             const token = req.cookies.token
                         const decoded=jwt.verify(token,process.env.JWT_SECRET)
            
                         const userId= decoded.id;
                        //  console.log("user",userId);
                         const user=await User.findById(userId);
                         console.log(user);
            const { search, categoryFilter, brandsFilter, sortBy, page, limit, maxPrice } = req.query;
            let filter = { isDeleted: false };
    
            const categories = await Category.find({});
            const brands = await Brand.find({});
    
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
    
            // Price filter
            if (maxPrice) {
                filter.price = { $lte: parseInt(maxPrice) };
            }
    
            // Sort options
            let sortOptions = { createdAt: -1 }; // Default: newest first
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
                    case 'newest':
                        sortOptions = { createdAt: -1 };
                        break;
                }
            }
    
            // Pagination logic
            let currentPage = parseInt(page) || 1;
            let itemsPerPage = parseInt(limit) || 3; // Changed to 9 for a 3x3 grid
            let skip = (currentPage - 1) * itemsPerPage;
    
            // Count total products
            let totalProducts = await Product.countDocuments(filter);
    
            // Fetch paginated products
            const product = await Product.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(itemsPerPage)
                .populate('brands')
                .populate('category');
    
            // Calculate total pages
            let totalPages = Math.ceil(totalProducts / itemsPerPage);
    
            // Build breadcrumbs
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
                user,
                product,
                categories,
                brands,
                breadcrumbs,
                success: req.query.added === 'true',
                currentFilters: { search, categoryFilter, brandsFilter, sortBy, maxPrice },
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
    order:async(req,res,next)=>{
        res.status(200).render('orders')
    },
   
};

module.exports = shopController;
