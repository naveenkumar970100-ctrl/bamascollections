import express from 'express';
import {
  getActivePaymentMethod,
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  setActivePaymentMethod,
  deletePaymentMethod,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Customer checkout fetches the active UPI & QR method
router.get('/active-method', getActivePaymentMethod);

// Protected Admin: Payment Methods CRUD & activation
router
  .route('/methods')
  .get(protect, admin, getPaymentMethods)
  .post(protect, admin, createPaymentMethod);

router
  .route('/methods/:id')
  .put(protect, admin, updatePaymentMethod)
  .delete(protect, admin, deletePaymentMethod);

router.put('/methods/:id/activate', protect, admin, setActivePaymentMethod);

// Protected Admin: Payments view and management
router.get('/', protect, admin, getAllPayments);
router
  .route('/:id')
  .get(protect, admin, getPaymentById)
  .delete(protect, admin, deletePayment);

router.put('/:id/status', protect, admin, updatePaymentStatus);

export default router;
