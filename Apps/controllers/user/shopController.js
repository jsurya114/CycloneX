const Category = require('../../models/categoryModel');
const Brand = require('../../models/brandModel');
const Product = require('../../models/productModel');

const shopController = {
    shopList: async (req, res) => {
        try {
            const { search, categoryFilter, brandsFilter, sortBy, page, limit } = req.query;
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

            if (categoryFilter) {
                const categoryObj = await Category.findOne({ name: categoryFilter });
                if (categoryObj) {
                    filter.category = categoryObj._id;
                }
            }

            if (brandsFilter) {
                const brandObj = await Brand.findOne({ name: brandsFilter });
                if (brandObj) {
                    filter.brands = brandObj._id;
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

            // Fetch paginated products
            const product = await Product.find({ ...filter, isDeleted: false })
                .sort(sortOptions)
                .skip(skip)
                .limit(itemsPerPage)
                .populate('brands')
                .populate('category');

            // Calculate total pages
            let totalPages = Math.ceil(totalProducts / itemsPerPage);

            let breadcrumbs = [
                { name: 'Home', url: '/' },
                { name: 'Shop', url: '/shoplist' }
            ];

            if (categoryFilter) {
                const categoryObj = await Category.findOne({ name: categoryFilter });
                if (categoryObj) {
                    breadcrumbs.push({
                        name: categoryObj.name,
                        url: `/shoplist?categoryFilter=${encodeURIComponent(categoryObj.name)}`
                    });
                }
            }

            if (brandsFilter) {
                const brandObj = await Brand.findOne({ name: brandsFilter });
                if (brandObj) {
                    breadcrumbs.push({
                        name: brandObj.name,
                        url: `/shoplist?brandsFilter=${encodeURIComponent(brandObj.name)}`
                    });
                }
            }

            res.render('shoplist', {
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
            console.error('Error loading shop page:', error);
            next(error)
        }
    },
};

module.exports = shopController;
