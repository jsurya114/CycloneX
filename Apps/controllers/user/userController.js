const Category = require('../../models/categoryModel')
const Brand = require('../../models/brandModel')
const Product =require('../../models/productModel')
const { category } = require('../admin/categoryController')
 const User= require('../../models/userModel')
 const Address = require('../../models/addressModel')
const jwt = require('jsonwebtoken')
const userController = {
    home: async (req, res,next) => {
        try {
            const { search, categoryFilter, brandsFilter, sortBy ,page,limit} = req.query;
            let filter = {};
             const token = req.cookies.token
             const decoded=jwt.verify(token,process.env.JWT_SECRET)

             const userId= decoded.id;
            //  console.log("user",userId);
             const user=await User.findById(userId);
             console.log(user);
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
                .populate({ path: 'brands', select: 'name' }) // Ensure only needed fields are populated
                .populate({ path: 'category', select: 'name' }) 

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
    

                // Filter out products with null category or brand
const filteredProducts = product.filter(pro => pro.category && pro.brands)
            res.render('home', {
                user,
                product: filteredProducts, 
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
    },
    showUserProfile:async (req,res,next) => {
try
{

 
    const userId= req.params.userId
const user = await User.findById(userId)


    console.log('usercontroller',user)
if(!userId) return res.status(404).json({success:false,message:'invalid input'})


        res.status(200).render('userprofile',{user})}
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

    }
        
    } 
    module.exports=userController