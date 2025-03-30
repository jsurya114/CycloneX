const { default: products } = require("razorpay/dist/types/products")
const brandModel = require("../../models/brandModel")
const { category } = require("../../controllers/admin/categoryController")

let {search}=req.query

let filter={}

if(search){
    filter.$or=[{products.ProductName:{$regex:search.trim(),$options:'i'}}]
}



__________________________________________________________________________________________________



let {categoryFilter,priceFilter} =req.query
if(categoryFilter){
    let cat = await categoryFilter.findOne({categoryFilter})
    if(cat){
        filter.category=cat._id
    }
}


____________________________________________________________________________________________________
let {sortBy}=req.query
let sortOptions={createdAt:-1}
if(sortBy){
    switch(sortBy){
        case 'phtol':
            sortOptions:{price}
    }
}

let {page=1,limit=3}=req.query
let currentPage=page
let itemsPerPage=limit
let skip = (currentPage-1)*itemsPerPage

const product = await Product.find(filter).sort(sortOptions).limit(limit).skip(skip)

const totalProducts = await Product.countDocuments(filter)

const totalPages = Math.ceil(totalProducts/itemsPerPage)


__________________________________________________________________________________________________




const token = req.cookies.token
const decoded = jwt.verify(token,process.env.JWT_SECRET)
const userId = decoded._id

const user = await User.findById(userId)
const product = await Product.find().populate('category').populate('brands')
const brands = await brandModel.find()
const category = await category.find()
const wishlist = await wishlist.findOne({userId})
