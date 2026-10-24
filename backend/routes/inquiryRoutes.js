import express from 'express';
import {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from '../controllers/inquiryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(createInquiry)
  .get(protect, admin, getInquiries);

router
  .route('/:id')
  .put(protect, admin, updateInquiryStatus)
  .delete(protect, admin, deleteInquiry);

export default router;
