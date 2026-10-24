import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { renderError } from '../views/responseView.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bamas_fallback_secret');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return renderError(res, 401, 'User associated with this token no longer exists');
      }

      next();
    } catch (error) {
      console.error('[Auth Middleware Error]:', error.message);
      return renderError(res, 401, 'Not authorized, token invalid or expired');
    }
  }

  if (!token) {
    return renderError(res, 401, 'Not authorized, no bearer token provided');
  }
};

export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bamas_fallback_secret');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.warn('[Optional Auth]: Token not verified:', error.message);
    }
  }
  next();
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return renderError(res, 403, 'Access denied: Admin privileges required');
  }
};
