import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  deleteUser,
  updateUserRole,
  getAdminInquiries,
} from '../controllers/adminController.js';
import { getAllUsers } from '../controllers/authController.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { getAllOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, admin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Collections / Products
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

import {
  updateInquiryStatus,
  deleteInquiry,
} from '../controllers/inquiryController.js';

// Inquiries
router.get('/inquiries', getAdminInquiries);
router.put('/inquiries/:id/status', updateInquiryStatus);
router.delete('/inquiries/:id', deleteInquiry);

export default router;
