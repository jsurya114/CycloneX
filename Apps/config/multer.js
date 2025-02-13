const multer = require('multer');
const path =require('path')
const storage =multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,'public/uploads')//images will saved here
    },filename:function(req,file,cb){
        cb(null,Date.now()+path.extname(file.originalname))//unique filena;me
    }
})
//only images allowed
const fileFilter = (req,file,cb)=>{
    const fileTypes = '/jpeg|jpg|png|gif/web/'
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase)
     const mimeType = fileTypes.test(file.mimetype)
     
     if(extName&&mimeType){
        return cb(null,true)
     } else {
        return cb(new Error('only images are allowed'),false)
     }
}

const uploads = multer({
    storage:storage,
    limits:{fileSize:5*1024*1024},
    fileFilter:fileFilter
}).array('images',5) //Max 5 images
module.exports = uploads