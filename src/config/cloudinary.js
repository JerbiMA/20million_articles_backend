const fs = require('fs');
const path = require('path');
const multer = require('multer');
const uploadsDirectory = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDirectory),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, extension)
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'image';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${extension}`);
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
 * Delete a locally stored image by its filename.
 * @param {string} publicId - Cloudinary public ID
 */
const deleteImage = async (publicId) => {
  if (!publicId) {
    return;
  }
  const filePath = path.join(uploadsDirectory, path.basename(publicId));
  if (filePath.startsWith(`${uploadsDirectory}${path.sep}`)) {
    await fs.promises.rm(filePath, { force: true });
  }
};

/**
 * Kept for compatibility with existing category and team services.
 * @param {string} url - Full Cloudinary URL
 * @returns {string|null} Public ID
 */
const getPublicIdFromUrl = (url) => {
  if (!url) {
    return null;
  }
  return path.basename(url);
};

module.exports = {
  upload,
  deleteImage,
  getPublicIdFromUrl,
  uploadsDirectory,
};
