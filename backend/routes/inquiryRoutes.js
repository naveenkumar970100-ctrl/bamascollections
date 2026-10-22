import express from 'express';
import {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
} from '../controllers/inquiryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(createInquiry)
  .get(protect, admin, getInquiries);

router.put('/:id', protect, admin, updateInquiryStatus);

export default router;
