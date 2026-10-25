import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, optionalAuth, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(optionalAuth, createOrder)
  .get(protect, admin, getAllOrders);

router.get('/myorders', protect, getMyOrders);
router.route('/:id')
  .get(protect, getOrderById)
  .delete(protect, admin, deleteOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
