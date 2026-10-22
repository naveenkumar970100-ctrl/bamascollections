import Order from '../models/Order.js';
import { renderSuccess, renderError } from '../views/responseView.js';
import { dispatchNotification } from './notificationController.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return renderError(res, 400, 'No order items supplied');
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return renderError(res, 400, 'Please provide complete delivery address');
    }

    // Calculate totals
    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0
    );
    const shippingPrice = itemsPrice > 5000 ? 0 : 250; // Free shipping over ₹5000
    const taxPrice = Math.round(itemsPrice * 0.05); // 5% GST
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'UPI / Cash on Delivery',
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      status: 'Placed',
    });

    const savedOrder = await order.save();

    // Real-time notification from Customer to Admin
    await dispatchNotification({
      recipientRole: 'admin',
      sender: req.user._id,
      senderName: req.user.name || 'Valued Customer',
      title: `New Order Placed: ₹${totalPrice.toLocaleString('en-IN')}`,
      message: `${req.user.name || 'Customer'} placed order #${savedOrder._id.toString().slice(-6).toUpperCase()} for ${orderItems.length} saree(s) to ${shippingAddress.city}, ${shippingAddress.state}.`,
      type: 'order',
      targetUrl: '/admin',
    });
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
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
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
      .populate('user', 'name email')
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

    return renderSuccess(res, 200, 'Order status updated', updatedOrder);
  } catch (error) {
    next(error);
  }
};
