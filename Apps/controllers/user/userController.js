const Category = require('../../models/categoryModel')
const Brand = require('../../models/brandModel')
const Product =require('../../models/productModel')
const { category } = require('../admin/categoryController')
 const User= require('../../models/userModel')
 const Cart = require('../../models/cartModel')
 const Order = require('../../models/orderModel')
 const Address = require('../../models/addressModel')
 
const jwt = require('jsonwebtoken')
const Review = require('../../models/reviewModel')
const Wishlist=require("../../models/wislistModel")
const Coupon =require('../../models/couponModel')
const userController = {
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
    productDetails:async (req, res,next) => {
        try {
            const id =req.params.id
const {search}=req.query
let filter ={}
const token = req.cookies.token;

let userId = null;
let user = null;
let cartCount = 0;

if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
    user = await User.findById(userId);
    
    let cartfind = await Cart.findOne({ user: userId });
    cartCount = cartfind ? cartfind.items.length : 0;
}

                        const categories = await Category.find({});
                                   const brands = await Brand.find({});
        const product = await Product.findById(id).populate('category').populate('brands')
        const review = await Review.find({ product: id }).populate('user', 'name')
        const productOffer = product.offer || 0; // If no offer, assume 0%
        const categoryOffer = (product.category && product.category.offer) ? product.category.offer : 0; 
        const maxOffer = Math.max(productOffer, categoryOffer); // Get the best discount
        
        const salePrice = product.price * (1 - maxOffer / 100); // Apply discount correctly
        
        let cartfind = await Cart.findOne({user: userId})
               
                 const breadcrumbs = [
                    { name: 'Home', url: '/' },
                    product.category ? { name: product.category.name, url: `/home?categoryFilter=${encodeURIComponent(product.category.name)}` } : { name: 'Category', url: '#' },
                    product.brands ? { name: product.brands.name, url: `/home?brandsFilter=${encodeURIComponent(product.brands.name)}` } : { name: 'Brand', url: '#' },
                    { name: product.productName, url: `/productdetails/${product._id}` }
                  ];
                  


        const relatedProducts= await Product.find({
            category:product.category,
         
            _id:{$ne:product._id},
           

        }).limit(10).populate('brands')
        if (search) {
            filter.$or = [
                { productName: { $regex: search.trim(), $options: "i" } },
                { 'brands.name': { $regex: search.trim(), $options: "i" } },
                { 'category.name': { $regex: search.trim(), $options: "i" } },
            ];
        }



        res.status(200).render('productdetails',{product, user: user ? user._id : null,
            relatedProducts, breadcrumbs,brands,cartCount,review,maxOffer,salePrice})
        
        } catch (error) {
            console.error(error)
            next(error)
        }




    },
 
    showUserProfile:async (req,res,next) => {
try
{

 
    const userId= req.params.userId
const user = await User.findById(userId)

const users= req.user.id
const wishlist = await Wishlist.countDocuments({ user: userId });
   let cartfind = await Cart.findOne({user: userId})
            const cartCount = cartfind.items.length
let orderCount=await Order.countDocuments({user:userId})
let reviewCount =await Review.countDocuments({user:userId})

let couponCount = await Coupon.countDocuments({refferedBy:{$in:[userId]}})
const returnOrderCount = await Order.countDocuments({ user: userId, orderStatus: "returned" })
  const {productId}=req.body
  const product= await Product.findById(productId)
if(!userId) return res.status(404).json({success:false,message:'invalid input'})
    const orders = await Order.find({ user: userId })
.populate("items.product")
.populate("address")
.sort({ timestamp: -1 })
let newUserrefferal =await User.findOne({user:userId}) 
        res.status(200).render('userprofile',{user,users,product: product || { _id: '' },wishlistCount:wishlist,cartCount,orderCount,returnOrderCount,orders,reviewCount,refferalCode:user.refferalCode,newUserrefferal,couponCount})}
        catch(error){
            next(error)
        }
    },
    userAddress:async (req,res,next) => {
    
try {
   
    
    const userId= req.params.userId
    if(!userId) return res.status(404).json({success:false,message:'invalid input'})

  const {fullName,email,mobile,country,state,address,pincode,landmark}=req.body  

  
  
  const errors = {};
            
  // Full Name validation
  if (!fullName || fullName.trim() === '') {
      errors.fullName = 'Full name is required';
  } else if (fullName.length < 3) {
      errors.fullName = 'Full name must be at least 3 characters';
  } else if (fullName.length > 50) {
      errors.fullName = 'Full name must not exceed 50 characters';
  } else if (!/^[a-zA-Z\s.]+$/.test(fullName)) {
      errors.fullName = 'Full name should contain only letters, spaces, and periods';
  }
  
  // Email validation
  if (!email || email.trim() === '') {
      errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
  }
  
  // Mobile validation
  if (!mobile || mobile.trim() === '') {
      errors.mobile = 'Mobile number is required';
  } else if (!/^\d{10}$/.test(mobile)) {
      errors.mobile = 'Mobile number should be 10 digits';
  }
  
  // Country validation
  if (!country || country.trim() === '') {
      errors.country = 'Country is required';
  } else if (country.length < 2) {
      errors.country = 'Country name is too short';
  } else if (!/^[a-zA-Z\s]+$/.test(country)) {
      errors.country = 'Country should contain only letters and spaces';
  }
  
  // State validation
  if (!state || state.trim() === '') {
      errors.state = 'State is required';
  } else if (state.length < 2) {
      errors.state = 'State name is too short';
  } else if (!/^[a-zA-Z\s]+$/.test(state)) {
      errors.state = 'State should contain only letters and spaces';
  }
  
  // Address validation
  if (!address || address.trim() === '') {
      errors.address = 'Address is required';
  } else if (address.length < 5) {
      errors.address = 'Address is too short';
  } else if (address.length > 200) {
      errors.address = 'Address is too long (max 200 characters)';
  }
  
  // Pincode validation
  if (!pincode || pincode.trim() === '') {
      errors.pincode = 'Pincode is required';
  } else if (!/^\d{6}$/.test(pincode)) {
      errors.pincode = 'Pincode should be 6 digits';
  }
  
  // Landmark validation (optional, but validate if provided)
  if (landmark && landmark.trim() !== '') {
      if (landmark.length > 100) {
          errors.landmark = 'Landmark is too long (max 100 characters)';
      }
  }
  
  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
      return res.status(400).json({
          success: false, 
          message: 'Validation failed',
          errors
      });
  }
  




  const existingAddress = await Address.findOne({ user: userId });

  if (existingAddress) {
      // Update existing address
      existingAddress.fullname = fullName;
      existingAddress.country = country;
      existingAddress.state = state;
      existingAddress.address = address;
      existingAddress.pincode = pincode;
      existingAddress.landmark = landmark || '';
      existingAddress.mobileNum = mobile;
      existingAddress.email = email;

      await existingAddress.save();
      return res.status(200).json({ success: true, message: 'Address updated successfully' });
  } else {
      // Create new address (existing logic)
      const newAddress = new Address({
          fullname: fullName,
          country,
          state,
          address,
          pincode,
          landmark,
          mobileNum: mobile,
          email,
          user: userId
      });
      await newAddress.save();
      return res.status(201).json({ success: true, message: 'Address added successfully' });
  }
 } catch (error) {
    next(error)
}

    },
  
        
    } 
    module.exports=userController