import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Inquiry from '../models/Inquiry.js';
import { renderSuccess, renderError, renderUserView } from '../views/responseView.js';

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
 * @desc    Create a new customer or admin user directly from Admin Panel
 * @route   POST /api/admin/users
 * @access  Private/Admin
 */
export const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, address } = req.body;
    if (!name || (!email && !phone) || !password) {
      return renderError(res, 400, 'Please provide customer name, password, and email or phone');
    }

    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const cleanPhone = phone ? phone.trim() : '';

    const query = [];
    if (cleanEmail) query.push({ email: cleanEmail });
    if (cleanPhone) query.push({ phone: cleanPhone });
    if (query.length > 0) {
      const existing = await User.findOne({ $or: query });
      if (existing) {
        return renderError(res, 400, 'A customer with this email or phone number already exists');
      }
    }

    const userEmail = cleanEmail || `${cleanPhone.replace(/[^0-9]/g, '')}@phone.bamascollections.com`;
    const user = await User.create({
      name: name.trim(),
      email: userEmail,
      phone: cleanPhone,
      password,
      role: role === 'admin' ? 'admin' : 'customer',
      address: address || {},
      authProvider: cleanEmail ? 'local' : 'phone',
    });

    const userView = renderUserView(user);
    return renderSuccess(res, 201, 'Customer account created successfully', userView);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a customer user profile and credentials (admin only)
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
export const updateAdminUser = async (req, res, next) => {
  try {
    const { name, email, phone, role, address, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return renderError(res, 404, 'Customer account not found');

    if (name) user.name = name.trim();
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const existing = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
      if (existing) {
        return renderError(res, 400, 'Another account is already registered with this email address');
      }
      user.email = cleanEmail;
    }
    if (phone !== undefined) user.phone = phone.trim();
    if (role && ['customer', 'admin'].includes(role)) {
      if (user.email === 'admin@bamas.com' && role !== 'admin') {
        return renderError(res, 400, 'Cannot change the role of the primary root administrator account');
      }
      user.role = role;
    }
    if (address) {
      user.address = {
        street: address.street ?? user.address?.street ?? '',
        city: address.city ?? user.address?.city ?? '',
        state: address.state ?? user.address?.state ?? '',
        postalCode: address.postalCode ?? user.address?.postalCode ?? '',
        country: address.country ?? user.address?.country ?? 'India',
      };
    }
    if (password && password.trim().length >= 6) {
      user.password = password.trim();
    }

    await user.save();
    const userView = renderUserView(user);
    return renderSuccess(res, 200, 'Customer details updated successfully', userView);
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
    if (!user) return renderError(res, 404, 'Customer account not found');
    if (user.email === 'admin@bamas.com') {
      return renderError(res, 400, 'Cannot delete the primary root administrator account');
    }
    if (req.user && req.user._id && user._id.toString() === req.user._id.toString()) {
      return renderError(res, 400, 'Cannot delete your own active administrator account');
    }
    await user.deleteOne();
    return renderSuccess(res, 200, 'Customer account deleted successfully', { id: req.params.id });
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
    const user = await User.findById(req.params.id);
    if (!user) return renderError(res, 404, 'User not found');
    if (user.email === 'admin@bamas.com' && role !== 'admin') {
      return renderError(res, 400, 'Cannot change the role of the primary root administrator');
    }
    user.role = role;
    await user.save();
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
