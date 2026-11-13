import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction reference ID is required'],
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'UPI / QR Code',
    },
    upiId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed', 'Refunded'],
      default: 'Completed',
      index: true,
    },
    customerName: {
      type: String,
      default: 'Valued Patron',
    },
    customerEmail: {
      type: String,
      default: '',
    },
    customerPhone: {
      type: String,
      default: '',
    },
    paymentProofUrl: {
      type: String,
      default: '',
    },
    verifiedByAdmin: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: '',
    },
    rawDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
