const multer = require('multer');
const path = require('path');
const fs = require('fs')
const sharp = require('sharp')
const { editProduct } = require('../controllers/admin/productloader');
const { editbrand } = require('../controllers/admin/productController');


const allowedTypes = /\.(jpeg|jpg|png|gif|webp)$/i


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const module =req.baseUrl.split('/')[2]
//         let uploadPath = `public/backend/imgs/${module}`
      
//         console.log('Uploaded File:', req.file);

//         // Append subfolders based on the module
//         if (req.body.type === 'product') {
//             uploadPath = path.join(uploadPath, 'products');
//         } else if (req.body.type === 'category') {
//             uploadPath = path.join(uploadPath, 'categories');
//         } else if (req.body.type === 'brand') {
//             uploadPath = path.join(uploadPath, 'brands');
//         }
//         cb(null, uploadPath); 
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });


// const fileFilter = (req, file, cb) => {
//     if (allowedTypes.test(path.extname(file.originalname).toLowerCase())) {
//         cb(null, true);
//     } else {
//         cb(new Error('Only JPEG, JPG, PNG,WEBP and GIF files are allowed!'), false);
//     }
// };


const getUploadPath = (req)=>{
    let uploadPath ='public/backend/imgs'
    if(req.originalUrl.includes('addproduct')||req.originalUrl.includes('editproduct')){
        uploadPath= path.join(uploadPath,'products')
    }else if(req.originalUrl.includes('addbrand')||req.originalUrl.includes('editbrand')){
        uploadPath=path.join(uploadPath,'brands')
    }else if(req.originalUrl.includes('addcategory')||req.originalUrl.includes('editcategory')){
        uploadPath=path.join(uploadPath,'categories')
    }
    // if(!fs.exitsSync(uploadPath)){
    //     //ensuring the path exitss
    //     fs.mkdirSync(uploadPath,{recursive:true})
    // }
    return uploadPath

}
//multer storage configuration
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        const uploadPath = getUploadPath(req)
        cb(null,uploadPath)
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname))
    }
})
const fileFilter=(req,file,cb)=>{
if(allowedTypes.test(path.extname(file.originalname).toLowerCase())){
cb(null,true)
}
else{
    cb(new Error('Only JPEG, JPG, PNG, WEBP, and GIF files are allowed!'),false)
}
}


const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter, 
    limits: { fileSize: 10 * 1024 * 1024 } 
})



module.exports = upload
