import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { renderSuccess, renderError, renderProductView } from '../views/responseView.js';
import { dispatchNotification } from './notificationController.js';
import { emitToAdmins, emitToUser, emitBroadcast } from '../config/socket.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Public / Authenticated
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      isPaid,
      paymentResult,
      totalPrice: clientTotalPrice,
      email: clientEmail,
      phone: clientPhone,
      name: clientName,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return renderError(res, 400, 'No order items supplied');
    }

    const normShipping = {
      fullName:
        (shippingAddress && (shippingAddress.fullName || shippingAddress.name)) ||
        clientName ||
        (req.user && req.user.name) ||
        'Valued Patron',
      phone:
        (shippingAddress && (shippingAddress.phone || shippingAddress.mobile)) ||
        clientPhone ||
        (req.user && req.user.phone) ||
        '9876543210',
      street: (shippingAddress && shippingAddress.street) || 'Main Street, Jubilee Hills',
      city: (shippingAddress && shippingAddress.city) || 'Hyderabad',
      state: (shippingAddress && shippingAddress.state) || 'Telangana',
      postalCode:
        (shippingAddress && (shippingAddress.postalCode || shippingAddress.pincode)) || '500033',
      country: (shippingAddress && shippingAddress.country) || 'India',
    };

    const customerEmail =
      clientEmail ||
      (shippingAddress && shippingAddress.email) ||
      (req.user && req.user.email) ||
      `${normShipping.phone.replace(/[^0-9]/g, '') || 'patron'}@bamascollections.com`;

    // Associate with existing user or req.user
    let userId = req.user ? req.user._id : null;
    if (!userId && customerEmail) {
      const existing = await User.findOne({ email: customerEmail.toLowerCase() });
      if (existing) {
        userId = existing._id;
      }
    }

    // Normalize order items
    const normItems = orderItems.map((item) => ({
      product: item.product || item.id || item._id || item.slug || 'saree',
      name: item.name || 'Bamas Heritage Saree',
      image: item.image || '',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity || item.qty) || 1,
    }));

    const itemsPrice = normItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 5000 ? 0 : 250;
    const taxPrice = Math.round(itemsPrice * 0.05);
    const totalPrice = clientTotalPrice || itemsPrice + shippingPrice + taxPrice;

    const orderPaid = isPaid !== undefined ? Boolean(isPaid) : true;
    const orderStatus = orderPaid ? 'Confirmed' : 'Placed';

    const order = new Order({
      user: userId,
      customerName: normShipping.fullName,
      customerEmail,
      customerPhone: normShipping.phone,
      orderItems: normItems,
      shippingAddress: normShipping,
      paymentMethod: paymentMethod || 'Demo Online Payment',
      paymentResult: paymentResult || {
        id: 'DEMO_PAY_' + Date.now(),
        status: orderPaid ? 'COMPLETED' : 'PENDING',
        method: paymentMethod || 'Demo Payment Gateway',
      },
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: orderPaid,
      paidAt: orderPaid ? new Date() : null,
      status: orderStatus,
    });

    const savedOrder = await order.save();

    // Real-time notification to Admin
    try {
      await dispatchNotification({
        recipientRole: 'admin',
        sender: userId || null,
        senderName: normShipping.fullName,
        title: `New Saree Order Placed: ₹${totalPrice.toLocaleString('en-IN')}`,
        message: `${normShipping.fullName} placed order #${savedOrder._id.toString().slice(-6).toUpperCase()} (${orderPaid ? 'Paid via Demo Gateway' : 'Pending'}). Shipping to ${normShipping.city}, ${normShipping.state}.`,
        type: 'order',
        targetUrl: '/admin',
      });
    } catch (notifErr) {
      console.warn('Admin notification notice:', notifErr.message);
    }

    // Real-Time Inventory Sync: decrement countInStock and broadcast live
    for (const item of normItems) {
      try {
        let p = null;
        if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
          p = await Product.findById(item.product);
        }
        if (!p && item.product) {
          p = await Product.findOne({ slug: item.product.toString().toLowerCase() });
        }
        if (!p && item.name) {
          p = await Product.findOne({ name: item.name });
        }
        if (p) {
          const currentCount = typeof p.countInStock === 'number' ? p.countInStock : 10;
          p.countInStock = Math.max(0, currentCount - (item.quantity || 1));
          if (p.countInStock <= 0) {
            p.inStock = false;
          }
          await p.save();
          emitBroadcast('product:updated', renderProductView(p));
        }
      } catch (stockErr) {
        console.warn('Inventory decrement notice:', stockErr.message);
      }
    }

    // ⚡ Real-Time WebSocket Emission: notify admins and customer
    emitToAdmins('order:new', savedOrder);
    if (userId) {
      emitToUser(userId, 'order:new', savedOrder);
    }

    return renderSuccess(res, 201, 'Order placed successfully', savedOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const userEmail = (req.user?.email || '').trim().toLowerCase();
    const query = {
      $or: [
        { user: req.user._id },
        ...(userEmail ? [{ customerEmail: new RegExp(`^${userEmail}$`, 'i') }] : []),
      ],
    };
    const orders = await Order.find(query).sort({ createdAt: -1 });
    return renderSuccess(res, 200, `Retrieved ${orders.length} order(s)`, orders);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return renderError(res, 404, 'Order not found');
    }

    // Verify ownership or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return renderError(res, 403, 'Not authorized to view this order');
    }

    return renderSuccess(res, 200, 'Order details', order);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (admin only)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    return renderSuccess(res, 200, 'All customer orders', orders);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, isPaid, isDelivered } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return renderError(res, 404, 'Order not found');
    }

    if (status) order.status = status;
    if (isPaid !== undefined) {
      order.isPaid = isPaid;
      if (isPaid) order.paidAt = new Date();
    }
    if (isDelivered !== undefined) {
      order.isDelivered = isDelivered;
      if (isDelivered) order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();

    // Real-time notification from Admin to Customer
    if (order.user) {
      await dispatchNotification({
        recipientRole: 'customer',
        recipient: order.user,
        sender: req.user._id,
        senderName: 'Bamas Admin',
        title: `Order #${order._id.toString().slice(-6).toUpperCase()} Status: ${order.status}`,
        message: `Your Bamas Collection saree order has been updated to "${order.status}". ${
          order.status === 'Shipped'
            ? 'Your artisanal package is in transit with priority courier!'
            : order.status === 'Delivered'
            ? 'Your saree has been delivered. We hope you cherish every drape!'
            : 'Thank you for choosing Bamas Collections.'
        }`,
        type: 'status_update',
        targetUrl: '/products',
      });
    }

    // ⚡ Real-Time WebSocket Emission: update order across admin and customer dashboards
    emitToAdmins('order:updated', updatedOrder);
    if (order.user) {
      emitToUser(order.user, 'order:updated', updatedOrder);
    }

    return renderSuccess(res, 200, 'Order status updated', updatedOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete order / booking
 * @route   DELETE /api/orders/:id or /api/admin/orders/:id
 * @access  Private/Admin
 */
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return renderError(res, 404, 'Order not found');
    }
    await Order.findByIdAndDelete(req.params.id);

    // ⚡ Real-Time WebSocket Emission: delete order
    emitToAdmins('order:deleted', { id: req.params.id });

    return renderSuccess(res, 200, 'Order deleted successfully');
  } catch (error) {
    next(error);
  }
};

