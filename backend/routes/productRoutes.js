import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.get('/featured', getFeaturedProducts);

router
  .route('/:idOrSlug')
  .get(getProductByIdOrSlug)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
