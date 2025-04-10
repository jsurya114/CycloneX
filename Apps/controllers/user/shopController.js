const Category = require('../../models/categoryModel');
const Brand = require('../../models/brandModel');
const Product = require('../../models/productModel');
const Cart = require('../../models/cartModel')
const jwt = require('jsonwebtoken')
const User = require('../../models/userModel')
const shopController = {
    shopList: async (req, res, next) => {
        try {
            const token = req.cookies.token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            
            const userId = decoded.id;
            const user = await User.findById(userId);
            let cartfind = await Cart.findOne({user: userId})
            const cartCount = cartfind.items.length
            const { search, categoryFilter, brandsFilter, sortBy, page, limit, maxPrice, minPrice} = req.query;
            
            let filter = { isDeleted: false };
    
            const categories = await Category.find({isBlocked: false});
            const brands = await Brand.find({isBlocked: false});
    
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
    
            // Pagination logic
            let currentPage = parseInt(page) || 1;
            let itemsPerPage = parseInt(limit) || 12;
            let skip = (currentPage - 1) * itemsPerPage;
    
            // Set initial sort option for database query
            // For most sort options, we'll sort at the database level
            let sortOptions = { createdAt: -1 }; // Default: newest first
            let needCustomSort = false;
            
            if (sortBy) {
                switch (sortBy) {
                    case 'priceLowHigh':
                    case 'priceHighLow':
                        // For price sorting, we'll need to sort after calculating sale price
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
    
        
            // Fetch all products that match filter
            const allProducts = await Product.find(filter)
                .sort(needCustomSort ? {} : sortOptions) // Only apply sort at database level if we're not doing custom sorting
                .populate('brands')
                .populate('category');
        
          
            // Calculate offer and sale price for each product
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
    
    
            // Apply price filter based on sale price
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
   


    
            // Apply custom sorting if needed (for sale price)
            if (needCustomSort) {
                if (sortBy === 'priceLowHigh') {
                    filteredProducts.sort((a, b) => a.salePrice - b.salePrice);
                } else if (sortBy === 'priceHighLow') {
                    filteredProducts.sort((a, b) => b.salePrice - a.salePrice);
                }
            }
       
    
            // Count total products after filtering by sale price
            const totalProducts = filteredProducts.length;
 
            // Apply pagination
            const productWithoffer = filteredProducts.slice(skip, skip + itemsPerPage);

            // Fetch cart
            let cart = await Cart.findOne({ user: user._id }).populate('items.product');
    
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
