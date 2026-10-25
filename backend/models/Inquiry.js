import mongoose from 'mongoose';

const messageSubSchema = new mongoose.Schema(
  {
    senderRole: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const inquirySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      default: 'General Saree Inquiry',
    },
    message: {
      type: String,
      required: [true, 'Please enter your message or styling question'],
    },
    sareeInterest: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['New', 'In Review', 'Answered', 'Archived'],
      default: 'New',
    },
    messages: [messageSubSchema],
  },
  {
    timestamps: true,
  }
);

inquirySchema.index({ email: 1, createdAt: -1 });
inquirySchema.index({ user: 1, createdAt: -1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;
