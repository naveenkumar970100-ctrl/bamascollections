import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ['admin', 'customer', 'all'],
      default: 'admin',
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
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

notificationSchema.index({ recipientRole: 1, recipient: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
