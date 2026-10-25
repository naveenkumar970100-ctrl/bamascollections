import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { renderSuccess, renderError } from '../views/responseView.js';
import { emitToAdmins, emitToUser, emitBroadcast } from '../config/socket.js';

/**
 * Internal helper to dispatch system notifications between Admin and User
 */
export const dispatchNotification = async ({
  recipientRole = 'admin',
  recipient = null,
  sender = null,
  senderName = 'Bamas System',
  title,
  message,
  type = 'system',
  targetUrl = '',
}) => {
  try {
    const notif = await Notification.create({
      recipientRole,
      recipient,
      sender,
      senderName,
      title,
      message,
      type,
      targetUrl,
    });

    // ⚡ Real-Time WebSocket Emission: deliver instantly
    if (recipientRole === 'admin') {
      emitToAdmins('notification:new', notif);
    } else if (recipientRole === 'all') {
      emitBroadcast('notification:new', notif);
    } else if (recipient) {
      emitToUser(recipient, 'notification:new', notif);
    }

    return notif;
  } catch (err) {
    console.error('[Notification Dispatch Error]:', err.message);
    return null;
  }
};

/**
 * @desc    Get all notifications for authenticated user (Admin or Customer)
 * @route   GET /api/notifications
 * @access  Private
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let filter = {};

    if (role === 'admin') {
      filter = {
        $or: [
          { recipientRole: 'admin' },
          { recipientRole: 'all' },
          { recipient: userId },
        ],
      };
    } else {
      filter = {
        $or: [
          { recipient: userId },
          { recipientRole: 'all' },
          { recipientRole: 'customer', recipient: null },
        ],
      };
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate unread count considering readBy array for broadcast notifications
    const formatted = notifications.map((n) => {
      const isRead =
        n.isRead ||
        (n.readBy && n.readBy.some((r) => r.userId && r.userId.toString() === userId.toString()));

      return {
        id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        senderName: n.senderName,
        targetUrl: n.targetUrl,
        isRead,
        createdAt: n.createdAt,
      };
    });

    const unreadCount = formatted.filter((n) => !n.isRead).length;

    return renderSuccess(res, 200, 'Notifications retrieved', {
      notifications: formatted,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark single notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(id);
    if (!notification) {
      return renderError(res, 404, 'Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    if (!notification.readBy.some((r) => r.userId && r.userId.toString() === userId.toString())) {
      notification.readBy.push({ userId, readAt: new Date() });
    }

    await notification.save();

    return renderSuccess(res, 200, 'Notification marked as read', { id });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all user notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let filter = {};
    if (role === 'admin') {
      filter = {
        $or: [
          { recipientRole: 'admin' },
          { recipientRole: 'all' },
          { recipient: userId },
        ],
      };
    } else {
      filter = {
        $or: [
          { recipient: userId },
          { recipientRole: 'all' },
          { recipientRole: 'customer', recipient: null },
        ],
      };
    }

    await Notification.updateMany(filter, {
      $set: { isRead: true, readAt: new Date() },
      $addToSet: { readBy: { userId, readAt: new Date() } },
    });

    return renderSuccess(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send custom notification (Admin to User, or User to Admin)
 * @route   POST /api/notifications/send
 * @access  Private
 */
export const sendCustomNotification = async (req, res, next) => {
  try {
    const { recipientId, recipientRole, title, message, type = 'broadcast', targetUrl = '' } = req.body;

    if (!title || !message) {
      return renderError(res, 400, 'Title and message are required');
    }

    let targetRole = recipientRole || (req.user.role === 'admin' ? 'customer' : 'admin');
    let targetRecipient = recipientId || null;

    if (targetRecipient) {
      const recipientUser = await User.findById(targetRecipient);
      if (!recipientUser) {
        return renderError(res, 404, 'Recipient user not found');
      }
    }

    const notification = await Notification.create({
      recipientRole: targetRole,
      recipient: targetRecipient,
      sender: req.user._id,
      senderName: req.user.name || (req.user.role === 'admin' ? 'Bamas Executive' : 'Customer'),
      title,
      message,
      type,
      targetUrl,
    });

    // ⚡ Real-Time WebSocket Emission
    if (targetRole === 'admin') {
      emitToAdmins('notification:new', notification);
    } else if (targetRecipient) {
      emitToUser(targetRecipient, 'notification:new', notification);
    } else {
      emitBroadcast('notification:new', notification);
    }

    return renderSuccess(res, 201, 'Notification sent successfully', notification);
  } catch (error) {
    next(error);
  }
};
