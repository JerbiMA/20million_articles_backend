const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const config = require('./env');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

/**
 * Multer storage engine for Cloudinary.
 * Uploads go to the 'mriwl' folder, auto-formatted as webp.
 */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mriwl',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  },
});

/**
 * Multer upload middleware.
 * - Max file size: 5MB
 * - Only image mimetypes allowed
 */
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

/**
 * Delete an image from Cloudinary by its public ID.
 * @param {string} publicId - Cloudinary public ID
 */
const deleteImage = async (publicId) => {
  if (!publicId) {
    return;
  }
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Extract the public ID from a Cloudinary URL.
 * @param {string} url - Full Cloudinary URL
 * @returns {string|null} Public ID
 */
const getPublicIdFromUrl = (url) => {
  if (!url) {
    return null;
  }
  // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/mriwl/filename.ext
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) {
    return null;
  }
  // Everything after 'upload/vXXX/' is the public ID (without extension)
  const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
  return pathAfterUpload.replace(/\.[^/.]+$/, ''); // Remove file extension
};

module.exports = {
  cloudinary,
  upload,
  deleteImage,
  getPublicIdFromUrl,
};
