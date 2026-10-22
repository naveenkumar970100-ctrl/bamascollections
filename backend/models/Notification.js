import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    // Target audience: 'admin' (all admins), 'customer' (specific customer or all customers), 'all' (everyone)
    recipientRole: {
      type: String,
      enum: ['admin', 'customer', 'all'],
      default: 'admin',
    },
    // Specific user recipient (null if sent to all admins or broadcast to all customers)
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Sender (null if automated system event)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    senderName: {
      type: String,
      default: 'Bamas System',
    },
    title: {
      type: String,
      required: [true, 'Please provide notification title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide notification message'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['order', 'inquiry', 'status_update', 'broadcast', 'registration', 'system'],
      default: 'system',
    },
    targetUrl: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for high-performance real-time queries
notificationSchema.index({ recipientRole: 1, recipient: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
