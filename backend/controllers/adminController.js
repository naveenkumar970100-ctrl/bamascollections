import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Inquiry from '../models/Inquiry.js';
import { renderSuccess, renderError } from '../views/responseView.js';

/**
 * @desc    Get admin dashboard overview stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalInquiries,
      orders,
      recentOrders,
      recentCustomers,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      Product.countDocuments(),
      Inquiry.countDocuments(),
      Order.find({}).select('totalPrice createdAt status isPaid'),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email'),
      User.find({ role: 'customer' })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email phone createdAt'),
    ]);

    const totalRevenue = orders
      .filter((o) => o.isPaid)
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const pendingOrders = orders.filter(
      (o) => o.status === 'Placed' || o.status === 'Confirmed'
    ).length;

    // Revenue by month (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const revenueByMonth = [];

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = month.toLocaleString('default', { month: 'short' });

      const monthRevenue = orders
        .filter(
          (o) =>
            o.isPaid &&
            new Date(o.createdAt) >= month &&
            new Date(o.createdAt) < nextMonth
        )
        .reduce((sum, o) => sum + o.totalPrice, 0);

      revenueByMonth.push({ month: label, revenue: monthRevenue });
    }

    // Order status breakdown
    const statusBreakdown = {
      Placed: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    orders.forEach((o) => {
      if (statusBreakdown[o.status] !== undefined) {
        statusBreakdown[o.status]++;
      }
    });

    return renderSuccess(res, 200, 'Dashboard stats', {
      overview: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalInquiries,
        totalRevenue: Math.round(totalRevenue),
        pendingOrders,
      },
      revenueByMonth,
      statusBreakdown,
      recentOrders,
      recentCustomers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user (admin only)
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return renderError(res, 404, 'User not found');
    if (user.role === 'admin') return renderError(res, 400, 'Cannot delete admin account');
    await user.deleteOne();
    return renderSuccess(res, 200, 'User deleted', { id: req.params.id });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role (admin only)
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['customer', 'admin'].includes(role)) {
      return renderError(res, 400, 'Invalid role');
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) return renderError(res, 404, 'User not found');
    return renderSuccess(res, 200, 'User role updated', { id: user._id, role: user.role });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all inquiries (admin only)
 * @route   GET /api/admin/inquiries
 * @access  Private/Admin
 */
export const getAdminInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    return renderSuccess(res, 200, 'All inquiries', inquiries);
  } catch (error) {
    next(error);
  }
};
