import Inquiry from '../models/Inquiry.js';
import { renderSuccess, renderError } from '../views/responseView.js';
import { dispatchNotification } from './notificationController.js';

/**
 * @desc    Submit a contact inquiry or bespoke saree consultation
 * @route   POST /api/inquiries
 * @access  Public
 */
export const createInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, sareeInterest } = req.body;

    if (!name || !email || !message) {
      return renderError(res, 400, 'Please provide name, email, and message');
    }

    const inquiry = await Inquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      subject: subject || 'General Saree Inquiry',
      message: message.trim(),
      sareeInterest: sareeInterest || '',
    });

    // Real-time notification from Customer to Admin
    await dispatchNotification({
      recipientRole: 'admin',
      senderName: name.trim(),
      title: `New Saree Inquiry: ${sareeInterest || subject || 'General Consultation'}`,
      message: `${name.trim()} (${email.trim()}${phone ? ` · ${phone}` : ''}): "${message.trim().slice(0, 120)}${message.length > 120 ? '...' : ''}"`,
      type: 'inquiry',
      targetUrl: '/admin',
    });

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
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    return renderSuccess(res, 200, `Retrieved ${inquiries.length} inquiries`, inquiries);
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

    await inquiry.deleteOne();

    return renderSuccess(res, 200, 'Inquiry deleted successfully');
  } catch (error) {
    next(error);
  }
};

