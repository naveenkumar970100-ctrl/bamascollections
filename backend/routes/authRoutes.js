import express from 'express';
import {
  registerUser,
  loginUser,
  googleAuth,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get('/users', protect, admin, getAllUsers);

export default router;
