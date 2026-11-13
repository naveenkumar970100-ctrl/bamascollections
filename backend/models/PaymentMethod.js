import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for this payment method'],
      default: 'Primary UPI Gateway',
      trim: true,
    },
    upiId: {
      type: String,
      required: [true, 'Please provide a valid UPI ID (e.g. bamas@okhdfcbank)'],
      trim: true,
      lowercase: true,
    },
    payeeName: {
      type: String,
      required: [true, 'Please provide the account / payee name'],
      default: 'Bamas Collections Atelier',
      trim: true,
    },
    bankName: {
      type: String,
      default: 'HDFC Bank',
      trim: true,
    },
    qrCodeUrl: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: 'Scan and pay using any UPI app (Google Pay, PhonePe, Paytm, BHIM)',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one payment method is active if isActive is set to true
paymentMethodSchema.pre('save', async function (next) {
  if (this.isModified('isActive') && this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
  next();
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

export default PaymentMethod;
