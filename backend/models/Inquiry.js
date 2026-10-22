import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;
