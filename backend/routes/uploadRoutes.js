import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { renderSuccess, renderError } from '../views/responseView.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

/**
 * @desc    Upload an image to Cloudinary
 * @route   POST /api/upload
 * @access  Public / Protected
 */
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return renderError(res, 400, 'Please attach an image file to upload');
    }

    const folder = req.body.folder || 'bamascollections/products';

    // Upload buffer to Cloudinary using upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Stream Error]:', error);
          return renderError(
            res,
            500,
            `Cloudinary upload error: ${error.message}. Please verify API Key 'create' permissions in Cloudinary console.`,
            error
          );
        }

        return renderSuccess(res, 201, 'Image uploaded successfully to Cloudinary', {
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
});

export default router;
