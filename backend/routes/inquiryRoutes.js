import express from 'express';
import {
  createInquiry,
  getInquiries,
  getMyInquiries,
  getInquiryById,
  sendInquiryMessage,
  updateInquiryStatus,
  deleteInquiry,
} from '../controllers/inquiryController.js';
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(optionalAuth, createInquiry)
  .get(protect, admin, getInquiries);

router.route('/my').get(optionalAuth, getMyInquiries);

router
  .route('/:id')
  .get(optionalAuth, getInquiryById)
  .put(protect, admin, updateInquiryStatus)
  .delete(protect, admin, deleteInquiry);

router.route('/:id/messages').post(optionalAuth, sendInquiryMessage);

export default router;
