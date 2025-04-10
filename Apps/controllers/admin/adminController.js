const User = require('../../models/userModel');

const Product = require('../../models/productModel');
const Brand = require('../../models/brandModel')
const Category = require('../../models/categoryModel')
const Productloader = require('../admin/productloader');
const { category } = require('./categoryController');

const adminController = {
  

    product2: async (req,res,next) => {
        try {

            const {search,statusFilter,categoryFilter,brandsFilter,sortBy,page,limit}=req.query
           
let filter={}
if (search) {
   
    
    filter.$or = [
        { productName: { $regex: search.trim(), $options: "i"} },
        {' brand.name': { $regex: search.trim(), $options: "i" } },
       
    ]
     
}
if(statusFilter==='active'){
    filter.isDeleted=false
}
else if(statusFilter==='deactive'){
    filter.isDeleted=true
}



if(categoryFilter){
    const categoryobj= await Category.findOne({name:categoryFilter,isBlocked:false})
    if(categoryobj){
        filter.category=categoryobj._id
    }


}

if(brandsFilter){
const brandobj = await Brand.findOne({name:brandsFilter})
if(brandobj){
    filter.brands=brandobj._id
}
}
// if (!statusFilter) {
//     filter.isDeleted = false; // Show only active products by default
// }

let sortOptions = {createdAt:-1}
if(sortBy){
    switch(sortBy){
        case 'price_asc':
            sortOptions = { price: 1 };
            break;
        case 'price_desc':
            sortOptions = { price: -1 };
            break;
        case 'name_asc':
            sortOptions = { productName: 1 };
            break;
        case 'name_desc':
            sortOptions = { productName: -1 };
            break;
    }
}

// Pagination logic
                      let currentPage = parseInt(page) || 1;
                      let itemsPerPage = parseInt(limit) || 4;
                      let skip = (currentPage - 1) * itemsPerPage;
          
                      // Count total products
                      let totalProducts = await Product.countDocuments(filter);




            const products = await Product.find(filter)
                .populate('brands')
                .populate('category').sort(sortOptions).skip(skip)
                .limit(itemsPerPage)
const categories = await Category.find()
const brands =await Brand.find()

 totalPages=Math.ceil(totalProducts/itemsPerPage)

            res.render('product-list2', { products,
                categories ,
                brands,
            success:req.query.added==='true',
            currentFilters: {
                search,
                statusFilter,
                categoryFilter,
                brandsFilter,
                sortBy,
                
            },
            currentPage,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                prevPage: currentPage > 1 ? currentPage - 1 : null,
        });
        } catch (error) {
          
            console.error(error);
next(error)
        }
    },

    showproductDetails:async (req,res,next) => {
        try{
            const productId = req.params.id
            const product =await Product.findById(productId).populate('category').populate('brands')
            if(!product){
                return res.status(404).redirect('/admin/product-list2')
            }
            res.render('product-details',{product})
        }catch(error){
            console.error('Error fetching product details:', error);
            next(error)
    
        }
    },
    
    userlist:async (req,res,next) => {
        try {
const {search,statusFilter,sortBy,page,limit}=req.query
let filter={}
if(search){
    filter.$or=[{name:{ $regex: search.trim(), $options: "i"}}]
}

if(statusFilter==='active'){
    filter.isActive=true

}
else if(statusFilter==='deactive'){
    filter.isActive=false
}

let sortOptions = { createdAt: -1 }; // default sort by most recent
if (sortBy) {
    switch (sortBy) {
        case 'date_asc':
            sortOptions = { createdAt: 1 }; // oldest first
            break;
        case 'date_desc':
            sortOptions = { createdAt: -1 }; // newest first
            break;
        case 'name_asc':
            sortOptions = { name: 1 }; // A to Z
            break;
        case 'name_desc':
            sortOptions = { name: -1 }; // Z to A
            break;
    }
}
let currentPage=parseInt(page)||1
let itemsPerPage=parseInt(limit)||4
let skip =(currentPage-1)*itemsPerPage
let totalUsers = await User.countDocuments(filter)


            const user = await User.find(filter).sort(sortOptions)
            .skip(skip)
            .limit(itemsPerPage)

            let totalPages = Math.ceil(totalUsers/itemsPerPage)
            res.render('userlist',{user,message:null,
                search,
                statusFilter,
                sortBy,
                currentPage,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                prevPage: currentPage > 1 ? currentPage - 1 : null,
            })
        } catch (error) {
         
            next(error)
        }
    },
    showUserdetails:async (req,res,next) => {
        try {
            const userId = req.params.id
            if(!userId){
                return res.status(400).redirect('/admin/userlist')
            }
            const user = await User.findById(userId)
            if(!user){
                return res.status(404).redirect('/admin/userlist')
            }
            res.render('userdetails',{user,message:null})
        } catch (error) {
            next(error)
        }
    },
    listinguser:async (req,res,next) => {
        try {
            const userId = req.params.id
            const user = await User.findById(userId)
            if(!user){
                return res.status(404).json({
                    success: false,
                    message: 'user not found'
                  });
            }
            user.isActive = !user.isActive
            await user.save()
            res.status(200).json({
                success: true,
                message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
              });
        } catch (error) {
            console.error(error);
            next(error)
        }
    },
    filtering: async (req,res,next) => {
        try {
            let { search, status, limit, sort, order } = req.query;
            let filter = {};
    
            if (search) {
                filter.$or = [
                    { fullName: new RegExp(search, "i") },
                    { email: new RegExp(search, "i") }
                ];
            }
    
            if (status) {
                filter.isActive = status === "Active";
            }
    
            const users = await User.find(filter)
                .sort({ [sort || "fullName"]: order === "desc" ? -1 : 1 })
                .limit(Number(limit) || 20);
    
            res.json(users);
        } catch (error) {
            next(error)
        }
    }
    
    
};

module.exports = adminController;