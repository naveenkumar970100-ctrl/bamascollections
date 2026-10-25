import Inquiry from '../models/Inquiry.js';
import User from '../models/User.js';
import { renderSuccess, renderError } from '../views/responseView.js';
import { dispatchNotification } from './notificationController.js';
import { emitToAdmins, emitToUser, emitToChat } from '../config/socket.js';

/**
 * @desc    Submit a contact inquiry or bespoke saree consultation
 * @route   POST /api/inquiries
 * @access  Public / Authenticated
 */
export const createInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, sareeInterest } = req.body;

    if (!name || !email || !message) {
      return renderError(res, 400, 'Please provide name, email, and message');
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMsg = message.trim();

    // Link user if authenticated or found by email
    let userId = req.user ? req.user._id : null;
    if (!userId && cleanEmail) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        userId = existingUser._id;
      }
    }

    // Initialize initial message in thread
    const initialMessage = {
      senderRole: 'user',
      senderId: userId || null,
      senderName: cleanName,
      text: cleanMsg,
      createdAt: new Date(),
    };

    const inquiry = await Inquiry.create({
      user: userId,
      name: cleanName,
      email: cleanEmail,
      phone: phone || '',
      subject: subject || 'General Saree Inquiry',
      message: cleanMsg,
      sareeInterest: sareeInterest || '',
      messages: [initialMessage],
      status: 'New',
    });

    // Real-time notification from Customer to Admin
    await dispatchNotification({
      recipientRole: 'admin',
      sender: userId,
      senderName: cleanName,
      title: `New Saree Inquiry: ${sareeInterest || subject || 'General Consultation'}`,
      message: `${cleanName} (${cleanEmail}${phone ? ` · ${phone}` : ''}): "${cleanMsg.slice(0, 120)}${cleanMsg.length > 120 ? '...' : ''}"`,
      type: 'inquiry',
      targetUrl: '/admin',
    });

    // Real-time WebSocket emission to all active Administrators
    emitToAdmins('inquiry:new', inquiry);
    emitToChat(inquiry._id, 'inquiry:new', inquiry);

    return renderSuccess(
      res,
      201,
      'Thank you for reaching out to Bamas Collections. Our styling team will contact you shortly.',
      inquiry
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all inquiries (admin only)
 * @route   GET /api/inquiries
 * @access  Private/Admin
 */
export const getInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({}).sort({ updatedAt: -1, createdAt: -1 });
    return renderSuccess(res, 200, `Retrieved ${inquiries.length} inquiries`, inquiries);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer's own inquiries & chat threads
 * @route   GET /api/inquiries/my
 * @access  Public / Authenticated
 */
export const getMyInquiries = async (req, res, next) => {
  try {
    const userEmail = req.user?.email || req.query.email;
    const userId = req.user?._id;

    if (!userEmail && !userId) {
      return renderError(res, 400, 'Please provide email or sign in to retrieve inquiries');
    }

    const query = [];
    if (userId) query.push({ user: userId });
    if (userEmail) query.push({ email: userEmail.toString().trim().toLowerCase() });

    const inquiries = await Inquiry.find({ $or: query }).sort({ updatedAt: -1 });
    return renderSuccess(res, 200, 'Customer inquiries retrieved', inquiries);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single inquiry by ID
 * @route   GET /api/inquiries/:id
 * @access  Public / Authenticated
 */
export const getInquiryById = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return renderError(res, 404, 'Inquiry not found');
    }
    return renderSuccess(res, 200, 'Inquiry retrieved', inquiry);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a direct message in an inquiry thread (Admin to User, or User to Admin)
 * @route   POST /api/inquiries/:id/messages
 * @access  Public / Authenticated
 */
export const sendInquiryMessage = async (req, res, next) => {
  try {
    const { text, senderName, senderRole: requestedRole } = req.body;

    if (!text || !text.trim()) {
      return renderError(res, 400, 'Message text is required');
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return renderError(res, 404, 'Inquiry thread not found');
    }

    const isAdmin = req.user?.role === 'admin';
    const role = isAdmin ? 'admin' : requestedRole === 'admin' ? 'admin' : 'user';
    const name =
      req.user?.name ||
      senderName ||
      (role === 'admin' ? 'Bamas Concierge' : inquiry.name || 'Valued Patron');

    const newMessage = {
      senderRole: role,
      senderId: req.user?._id || null,
      senderName: name.trim(),
      text: text.trim(),
      createdAt: new Date(),
    };

    // Initialize messages array if not present
    if (!Array.isArray(inquiry.messages)) {
      inquiry.messages = [];
    }

    // If empty messages array, seed initial inquiry message
    if (inquiry.messages.length === 0 && inquiry.message) {
      inquiry.messages.push({
        senderRole: 'user',
        senderId: inquiry.user || null,
        senderName: inquiry.name,
        text: inquiry.message,
        createdAt: inquiry.createdAt || new Date(),
      });
    }

    inquiry.messages.push(newMessage);

    // Update inquiry status
    if (role === 'admin') {
      inquiry.status = 'Answered';
    } else {
      inquiry.status = 'In Review';
    }

    const updated = await inquiry.save();

    // ⚡ Real-Time WebSocket Emission:
    // 1. Broadcast to the specific inquiry chat room
    emitToChat(inquiry._id, 'message:new', {
      inquiryId: inquiry._id,
      message: newMessage,
      inquiry: updated,
    });

    // 2. Broadcast to all active Administrators
    emitToAdmins('message:new', {
      inquiryId: inquiry._id,
      message: newMessage,
      inquiry: updated,
    });
    emitToAdmins('inquiry:updated', updated);

    // 3. Broadcast to user room if registered
    if (inquiry.user) {
      emitToUser(inquiry.user, 'message:new', {
        inquiryId: inquiry._id,
        message: newMessage,
        inquiry: updated,
      });
    }

    // Dispatch system notification
    if (role === 'admin') {
      // Notify customer
      if (inquiry.user) {
        await dispatchNotification({
          recipientRole: 'customer',
          recipient: inquiry.user,
          sender: req.user?._id,
          senderName: 'Bamas Concierge',
          title: `Reply from Bamas Concierge`,
          message: `${name}: "${text.trim().slice(0, 100)}${text.length > 100 ? '...' : ''}"`,
          type: 'inquiry',
          targetUrl: '/contact',
        });
      }
    } else {
      // Notify admin
      await dispatchNotification({
        recipientRole: 'admin',
        sender: req.user?._id || null,
        senderName: name,
        title: `Client Message on Inquiry #${inquiry._id.toString().slice(-6).toUpperCase()}`,
        message: `${name}: "${text.trim().slice(0, 100)}${text.length > 100 ? '...' : ''}"`,
        type: 'inquiry',
        targetUrl: '/admin',
      });
    }

    return renderSuccess(res, 201, 'Message sent successfully', {
      message: newMessage,
      inquiry: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update inquiry status
 * @route   PUT /api/inquiries/:id
 * @access  Private/Admin
 */
export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return renderError(res, 404, 'Inquiry not found');
    }

    if (status) inquiry.status = status;
    const updated = await inquiry.save();

    // Real-time WebSocket emission
    emitToAdmins('inquiry:status_updated', updated);
    emitToChat(updated._id, 'inquiry:status_updated', updated);

    return renderSuccess(res, 200, 'Inquiry status updated', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an inquiry
 * @route   DELETE /api/inquiries/:id
 * @access  Private/Admin
 */
export const deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return renderError(res, 404, 'Inquiry not found');
    }

    const id = inquiry._id;
    await inquiry.deleteOne();

    // Real-time WebSocket emission
    emitToAdmins('inquiry:deleted', { id });
    emitToChat(id, 'inquiry:deleted', { id });

    return renderSuccess(res, 200, 'Inquiry deleted successfully');
  } catch (error) {
    next(error);
  }
};
