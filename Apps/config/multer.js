const multer = require('multer');
const path = require('path');


const allowedTypes = /\.(jpeg|jpg|png|gif|webp)$/i;


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const module = req.originalUrl.split('/')[2]
        const uploadPath = `public/backend/imgs/${module}`
      

        if (req.body.type === 'product') {
            uploadPath = path.join(uploadPath, 'products');
        } else if (req.body.type === 'category') {
            uploadPath = path.join(uploadPath, 'categories');
        } else if (req.body.type === 'brand') {
            uploadPath = path.join(uploadPath, 'brands');
        }
        cb(null, uploadPath); 
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


const fileFilter = (req, file, cb) => {
    if (allowedTypes.test(path.extname(file.originalname).toLowerCase())) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, JPG, PNG,WEBP and GIF files are allowed!'), false);
    }
};


const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter, 
    limits: { fileSize: 5 * 1024 * 1024 } 
});

module.exports = upload;
