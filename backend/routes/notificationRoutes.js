import express from 'express';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  sendCustomNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.put('/read-all', markAllNotificationsRead);
router.put('/:id/read', markNotificationRead);
router.post('/send', sendCustomNotification);

export default router;
