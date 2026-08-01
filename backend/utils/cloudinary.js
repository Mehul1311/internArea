const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_secret'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'internshala_clone';
    let resource_type = 'auto';

    if (file.mimetype === 'application/pdf') {
      folder = 'internshala_clone/resumes';
    } else if (file.mimetype.startsWith('image/')) {
      folder = 'internshala_clone/images';
    }

    return {
      folder: folder,
      resource_type: resource_type,
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    };
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

module.exports = {
  cloudinary,
  upload
};
