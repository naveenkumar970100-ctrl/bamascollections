import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { renderSuccess, renderError, renderUserView } from '../views/responseView.js';
import { dispatchNotification } from './notificationController.js';

// Helper to generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'bamas_fallback_secret', {
    expiresIn: '30d',
  });
};

/**
 * Ensure default Admin user exists in DB
 */
export const ensureAdminUser = async () => {
  try {
    const adminEmail = 'admin@bamas.com';
    let adminUser = await User.findOne({ email: adminEmail }).select('+password');
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Bamas Admin',
        email: adminEmail,
        password: 'admin@123',
        role: 'admin',
        phone: '+91 98765 43210',
      });
      console.log('👑 [Admin Init]: Created default admin user admin@bamas.com with role "admin"');
    } else {
      adminUser.role = 'admin';
      adminUser.password = 'admin@123';
      await adminUser.save();
      console.log('👑 [Admin Init]: Verified admin user admin@bamas.com with role "admin" and password "admin@123"');
    }
  } catch (err) {
    console.error('⚠️ [Admin Init Notice]:', err.message);
  }
};

/**
 * @desc    Register a new customer account (supports Email, Phone, or both)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    if (!name || (!email && !phone) || !password) {
      return renderError(res, 400, 'Please provide your name, password, and email or phone number');
    }

    if (!confirmPassword) {
      return renderError(res, 400, 'Please confirm your password');
    }

    if (password !== confirmPassword) {
      return renderError(res, 400, 'Passwords do not match. Please verify and confirm your password');
    }

    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const cleanPhone = phone ? phone.trim() : '';

    // Check if user exists by email or phone
    const query = [];
    if (cleanEmail) query.push({ email: cleanEmail });
    if (cleanPhone) query.push({ phone: cleanPhone });

    if (query.length > 0) {
      const existingUser = await User.findOne({ $or: query });
      if (existingUser) {
        return renderError(res, 400, 'An account with this email or phone number already exists');
      }
    }

    // Determine fallback email if only phone was provided
    const userEmail = cleanEmail || `${cleanPhone.replace(/[^0-9]/g, '')}@phone.bamascollections.com`;

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: userEmail,
      password,
      phone: cleanPhone,
      authProvider: cleanEmail ? 'local' : 'phone',
      role: 'customer',
    });

    const token = generateToken(user._id);
    const userView = renderUserView(user, token);

    // Notify Admin about new customer registration
    dispatchNotification({
      recipientRole: 'admin',
      sender: user._id,
      senderName: user.name,
      title: 'New Customer Registered',
      message: `${user.name} (${cleanEmail || cleanPhone}) created an account via ${cleanEmail ? 'Email' : 'Phone'}.`,
      type: 'registration',
      targetUrl: '/admin',
    });

    return renderSuccess(res, 201, 'Account successfully created! Welcome to Bamas Collections', userView);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate customer or admin (supports Email or Phone number)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, phone, identifier, password } = req.body;
    const loginIdentifier = (identifier || email || phone || '').trim();

    if (!loginIdentifier || !password) {
      return renderError(res, 400, 'Please provide email/phone number and password');
    }

    // Special quick check for admin@bamas.com to ensure seed matches
    if (loginIdentifier.toLowerCase() === 'admin@bamas.com') {
      const existingAdmin = await User.findOne({ email: 'admin@bamas.com' }).select('+password');
      if (!existingAdmin) {
        await ensureAdminUser();
      }
    }

    // Search by email (case-insensitive) or by phone number
    const isEmail = loginIdentifier.includes('@');
    const user = isEmail
      ? await User.findOne({ email: loginIdentifier.toLowerCase() }).select('+password')
      : await User.findOne({
          $or: [
            { phone: loginIdentifier },
            { email: `${loginIdentifier.replace(/[^0-9]/g, '')}@phone.bamascollections.com` },
            { email: loginIdentifier.toLowerCase() },
          ],
        }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return renderError(res, 401, 'Invalid credentials. Please verify your email/phone and password');
    }

    const token = generateToken(user._id);
    const userView = renderUserView(user, token);

    return renderSuccess(
      res,
      200,
      user.role === 'admin' ? 'Welcome back, Admin!' : 'Welcome back! Signed in successfully',
      userView
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate or register via Google OAuth
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = async (req, res, next) => {
  try {
    const { email, name, avatar, googleId } = req.body;

    if (!email) {
      return renderError(res, 400, 'Google authentication requires a verified email');
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Auto-register user with Google provider
      user = await User.create({
        name: name?.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: avatar || '',
        authProvider: 'google',
        role: 'customer',
      });
    }

    const token = generateToken(user._id);
    const userView = renderUserView(user, token);

    return renderSuccess(res, 200, 'Signed in with Google successfully', userView);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return renderError(res, 404, 'User profile not found');
    }
    return renderSuccess(res, 200, 'Profile retrieved', renderUserView(user));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update customer profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return renderError(res, 404, 'User not found');
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

    if (req.body.address) {
      user.address = {
        ...user.address,
        ...req.body.address,
      };
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    const token = generateToken(updatedUser._id);

    return renderSuccess(res, 200, 'Profile updated successfully', renderUserView(updatedUser, token));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    const views = users.map((u) => renderUserView(u));
    return renderSuccess(res, 200, 'All customer accounts', views);
  } catch (error) {
    next(error);
  }
};
