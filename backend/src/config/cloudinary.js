const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const toeicUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder:           'english-app/toeic',
      allowed_formats:  ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      resource_type:    'image',
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const avatarUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder:          'english-app/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation:  [{ width: 200, height: 200, crop: 'fill' }],
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { cloudinary, toeicUpload, avatarUpload };
