import PaymentMethod from '../models/PaymentMethod.js';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import { renderSuccess, renderError } from '../views/responseView.js';
import { emitBroadcast, emitToAdmins, emitToUser } from '../config/socket.js';

/**
 * Default fallback UPI configuration
 */
const DEFAULT_UPI_CONFIG = {
  title: 'Primary Bamas UPI Gateway',
  upiId: 'bamas@okhdfcbank',
  payeeName: 'Bamas Collections Atelier',
  bankName: 'HDFC Bank',
  qrCodeUrl: '',
  description: 'Scan using any UPI App (Google Pay, PhonePe, Paytm, BHIM)',
  isActive: true,
  isDefault: true,
};

/**
 * @desc    Get currently active payment method (UPI & QR) for customers
 * @route   GET /api/payments/active-method
 * @access  Public
 */
export const getActivePaymentMethod = async (req, res, next) => {
  try {
    let activeMethod = await PaymentMethod.findOne({ isActive: true });

    if (!activeMethod) {
      // Check if any method exists
      const anyMethod = await PaymentMethod.findOne().sort({ createdAt: -1 });
      if (anyMethod) {
        anyMethod.isActive = true;
        await anyMethod.save();
        activeMethod = anyMethod;
      } else {
        // Seed default method
        activeMethod = await PaymentMethod.create(DEFAULT_UPI_CONFIG);
      }
    }

    return renderSuccess(res, 200, 'Active payment gateway retrieved', activeMethod);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all payment methods (CRUD read)
 * @route   GET /api/payments/methods
 * @access  Private/Admin
 */
export const getPaymentMethods = async (req, res, next) => {
  try {
    let methods = await PaymentMethod.find({}).sort({ isActive: -1, createdAt: -1 });

    if (methods.length === 0) {
      const defaultMethod = await PaymentMethod.create(DEFAULT_UPI_CONFIG);
      methods = [defaultMethod];
    }

    return renderSuccess(res, 200, 'All configured payment methods', methods);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new UPI & QR payment method (CRUD create)
 * @route   POST /api/payments/methods
 * @access  Private/Admin
 */
export const createPaymentMethod = async (req, res, next) => {
  try {
    const { title, upiId, payeeName, bankName, qrCodeUrl, description, isActive } = req.body;

    if (!upiId) {
      return renderError(res, 400, 'Please provide a valid UPI ID');
    }

    const cleanUpi = upiId.trim().toLowerCase();
    if (!cleanUpi.includes('@')) {
      return renderError(res, 400, 'Invalid UPI ID format. Must contain "@" (e.g. bamas@okhdfcbank)');
    }

    // Check count of existing
    const count = await PaymentMethod.countDocuments();
    const shouldBeActive = isActive === true || count === 0;

    if (shouldBeActive) {
      await PaymentMethod.updateMany({}, { $set: { isActive: false } });
    }

    const newMethod = await PaymentMethod.create({
      title: title?.trim() || `UPI - ${cleanUpi}`,
      upiId: cleanUpi,
      payeeName: payeeName?.trim() || 'Bamas Collections Atelier',
      bankName: bankName?.trim() || 'HDFC Bank',
      qrCodeUrl: qrCodeUrl?.trim() || '',
      description: description?.trim() || 'Scan using any UPI App (Google Pay, PhonePe, Paytm, BHIM)',
      isActive: shouldBeActive,
      createdBy: req.user?._id || null,
    });

    // ⚡ Real-Time WebSocket Emission: Broadcast updated payment config to all customer checkouts and admins
    if (shouldBeActive) {
      emitBroadcast('payment_method:updated', newMethod);
      emitBroadcast('payment_config:updated', newMethod);
    }
    emitToAdmins('payment_methods:changed', await PaymentMethod.find({}).sort({ isActive: -1, createdAt: -1 }));

    return renderSuccess(res, 201, 'Payment method added successfully', newMethod);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing UPI & QR payment method (CRUD update)
 * @route   PUT /api/payments/methods/:id
 * @access  Private/Admin
 */
export const updatePaymentMethod = async (req, res, next) => {
  try {
    const { title, upiId, payeeName, bankName, qrCodeUrl, description, isActive } = req.body;

    const method = await PaymentMethod.findById(req.params.id);
    if (!method) {
      return renderError(res, 404, 'Payment method not found');
    }

    if (upiId) {
      const cleanUpi = upiId.trim().toLowerCase();
      if (!cleanUpi.includes('@')) {
        return renderError(res, 400, 'Invalid UPI ID format. Must contain "@" (e.g. bamas@okhdfcbank)');
      }
      method.upiId = cleanUpi;
    }

    if (title !== undefined) method.title = title.trim();
    if (payeeName !== undefined) method.payeeName = payeeName.trim();
    if (bankName !== undefined) method.bankName = bankName.trim();
    if (qrCodeUrl !== undefined) method.qrCodeUrl = qrCodeUrl.trim();
    if (description !== undefined) method.description = description.trim();

    if (isActive === true) {
      await PaymentMethod.updateMany({ _id: { $ne: method._id } }, { $set: { isActive: false } });
      method.isActive = true;
    } else if (isActive === false && method.isActive) {
      // Cannot deactivate the only active method unless another is activated
      const other = await PaymentMethod.findOne({ _id: { $ne: method._id } });
      if (other) {
        other.isActive = true;
        await other.save();
        method.isActive = false;
      }
    }

    const updated = await method.save();

    // ⚡ Real-Time WebSocket Emission: notify all customer screens immediately
    const active = await PaymentMethod.findOne({ isActive: true });
    if (active) {
      emitBroadcast('payment_method:updated', active);
      emitBroadcast('payment_config:updated', active);
    }
    emitToAdmins('payment_methods:changed', await PaymentMethod.find({}).sort({ isActive: -1, createdAt: -1 }));

    return renderSuccess(res, 200, 'Payment method updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set a specific payment method as active
 * @route   PUT /api/payments/methods/:id/activate
 * @access  Private/Admin
 */
export const setActivePaymentMethod = async (req, res, next) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) {
      return renderError(res, 404, 'Payment method not found');
    }

    await PaymentMethod.updateMany({}, { $set: { isActive: false } });
    method.isActive = true;
    await method.save();

    // ⚡ Real-Time WebSocket Emission: instantly switch customer checkout QR and UPI ID
    emitBroadcast('payment_method:updated', method);
    emitBroadcast('payment_config:updated', method);
    emitToAdmins('payment_methods:changed', await PaymentMethod.find({}).sort({ isActive: -1, createdAt: -1 }));

    return renderSuccess(res, 200, `Activated "${method.title}" as live payment gateway`, method);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete payment method (CRUD delete)
 * @route   DELETE /api/payments/methods/:id
 * @access  Private/Admin
 */
export const deletePaymentMethod = async (req, res, next) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) {
      return renderError(res, 404, 'Payment method not found');
    }

    const wasActive = method.isActive;
    await PaymentMethod.findByIdAndDelete(req.params.id);

    // If deleted method was active, promote another one
    if (wasActive) {
      const remaining = await PaymentMethod.findOne().sort({ createdAt: -1 });
      if (remaining) {
        remaining.isActive = true;
        await remaining.save();
        emitBroadcast('payment_method:updated', remaining);
        emitBroadcast('payment_config:updated', remaining);
      } else {
        const seeded = await PaymentMethod.create(DEFAULT_UPI_CONFIG);
        emitBroadcast('payment_method:updated', seeded);
        emitBroadcast('payment_config:updated', seeded);
      }
    }

    emitToAdmins('payment_methods:changed', await PaymentMethod.find({}).sort({ isActive: -1, createdAt: -1 }));

    return renderSuccess(res, 200, 'Payment method deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Sync orders that don't have a Payment document yet
 */
const syncOrdersToPayments = async () => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    for (const order of orders) {
      const txnId =
        order.paymentResult?.id ||
        `ORD_${order._id.toString().slice(-8).toUpperCase()}`;

      const exists = await Payment.findOne({
        $or: [{ order: order._id }, { transactionId: txnId }],
      });

      if (!exists) {
        const isPaid = Boolean(order.isPaid);
        let status = 'Completed';
        if (!isPaid) {
          status = order.status === 'Cancelled' ? 'Failed' : 'Pending';
        }

        const methodStr = order.paymentMethod || 'UPI / QR Code';
        let upiId = '';
        if (methodStr.includes('(') && methodStr.includes('@')) {
          const match = methodStr.match(/\((.*?)\)/);
          if (match && match[1]) upiId = match[1];
        }

        await Payment.create({
          order: order._id,
          user: order.user || null,
          transactionId: txnId,
          amount: order.totalPrice || 0,
          paymentMethod: methodStr,
          upiId: upiId || (methodStr.toLowerCase().includes('upi') ? 'bamas@okhdfcbank' : ''),
          status,
          customerName: order.customerName || order.shippingAddress?.fullName || 'Valued Patron',
          customerEmail: order.customerEmail || '',
          customerPhone: order.customerPhone || order.shippingAddress?.phone || '',
          verifiedByAdmin: isPaid,
          paidAt: order.paidAt || order.createdAt || new Date(),
          rawDetails: order.paymentResult || {},
        });
      }
    }
  } catch (err) {
    console.warn('Sync orders to payments note:', err.message);
  }
};

/**
 * @desc    Get all payment records for Admin Payments Page
 * @route   GET /api/payments
 * @access  Private/Admin
 */
export const getAllPayments = async (req, res, next) => {
  try {
    // Auto-sync any unrecorded orders first
    await syncOrdersToPayments();

    const { status, keyword, method } = req.query;

    const filter = {};
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (method && method !== 'All') {
      filter.paymentMethod = new RegExp(method, 'i');
    }
    if (keyword) {
      const regex = new RegExp(keyword.trim(), 'i');
      filter.$or = [
        { transactionId: regex },
        { customerName: regex },
        { customerEmail: regex },
        { customerPhone: regex },
        { upiId: regex },
        { paymentMethod: regex },
      ];
    }

    const payments = await Payment.find(filter)
      .populate('order', 'orderItems shippingAddress status totalPrice createdAt isPaid')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    // Aggregate statistics
    const all = await Payment.find({});
    const totalRevenue = all
      .filter((p) => p.status === 'Completed')
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    const completedCount = all.filter((p) => p.status === 'Completed').length;
    const pendingCount = all.filter((p) => p.status === 'Pending').length;
    const refundedCount = all.filter((p) => p.status === 'Refunded').length;

    // Today's total
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayRevenue = all
      .filter((p) => p.status === 'Completed' && new Date(p.createdAt) >= startOfToday)
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    return renderSuccess(res, 200, 'Payment transactions list', {
      payments,
      stats: {
        totalRevenue,
        todayRevenue,
        totalPayments: all.length,
        completedCount,
        pendingCount,
        refundedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single payment details
 * @route   GET /api/payments/:id
 * @access  Private/Admin
 */
export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order')
      .populate('user', 'name email phone');

    if (!payment) {
      return renderError(res, 404, 'Payment record not found');
    }

    return renderSuccess(res, 200, 'Payment details', payment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update payment status (Verify, Approve, Pending, Refund)
 * @route   PUT /api/payments/:id/status
 * @access  Private/Admin
 */
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    if (!['Completed', 'Pending', 'Failed', 'Refunded'].includes(status)) {
      return renderError(res, 400, 'Invalid status. Must be Completed, Pending, Failed, or Refunded');
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return renderError(res, 404, 'Payment record not found');
    }

    payment.status = status;
    if (notes !== undefined) payment.notes = notes;
    if (status === 'Completed') {
      payment.verifiedByAdmin = true;
      if (!payment.paidAt) payment.paidAt = new Date();
    } else if (status === 'Refunded') {
      payment.verifiedByAdmin = true;
    }

    const updatedPayment = await payment.save();

    // Sync linked Order if present
    if (payment.order) {
      const order = await Order.findById(payment.order);
      if (order) {
        if (status === 'Completed') {
          order.isPaid = true;
          order.paidAt = payment.paidAt || new Date();
          if (order.paymentResult) {
            order.paymentResult.status = 'COMPLETED';
          }
          if (order.status === 'Placed') {
            order.status = 'Confirmed';
          }
        } else if (status === 'Refunded' || status === 'Failed') {
          order.isPaid = false;
          if (order.paymentResult) {
            order.paymentResult.status = status.toUpperCase();
          }
        } else if (status === 'Pending') {
          order.isPaid = false;
          if (order.paymentResult) {
            order.paymentResult.status = 'PENDING';
          }
        }
        await order.save();
        emitToAdmins('order:updated', order);
        if (order.user) {
          emitToUser(order.user, 'order:updated', order);
        }
      }
    }

    // ⚡ Real-Time WebSocket Emission: update payments table
    emitToAdmins('payment:updated', updatedPayment);

    return renderSuccess(res, 200, `Payment marked as ${status}`, updatedPayment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete payment record
 * @route   DELETE /api/payments/:id
 * @access  Private/Admin
 */
export const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return renderError(res, 404, 'Payment record not found');
    }

    await Payment.findByIdAndDelete(req.params.id);
    emitToAdmins('payment:deleted', { id: req.params.id });

    return renderSuccess(res, 200, 'Payment record deleted successfully');
  } catch (error) {
    next(error);
  }
};
