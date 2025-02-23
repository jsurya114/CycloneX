const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp'); // required if you want to use it later

const allowedTypes = /\.(jpeg|jpg|png|gif|webp)$/i;

const getUploadPath = (req) => {
  let uploadPath = 'public/backend/imgs';
  if (req.originalUrl.includes('addproduct') || req.originalUrl.includes('editproduct')) {
    uploadPath = path.join(uploadPath, 'products');
  } else if (req.originalUrl.includes('addbrand') || req.originalUrl.includes('editbrand')) {
    uploadPath = path.join(uploadPath, 'brands');
  } else if (req.originalUrl.includes('addcategory') || req.originalUrl.includes('editcategory')) {
    uploadPath = path.join(uploadPath, 'categories');
  }
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = getUploadPath(req);
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
    cb(new Error('Only JPEG, JPG, PNG, WEBP, and GIF files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter, 
  limits: { fileSize: 10 * 1500 * 1500 } 
});

module.exports = upload;
