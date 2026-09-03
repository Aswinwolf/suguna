import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

/**
 * Populates req.user when a valid token is present, but never rejects.
 * Used for endpoints that are public yet richer for authenticated roles.
 */
export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch {
    // Ignore invalid tokens for optional auth.
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied, admin only' });
};

export const technicianOnly = (req, res, next) => {
  if (req.user && req.user.role === 'technician') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied, technicians only' });
};

/**
 * Flexible role guard: authorize('admin', 'technician') allows either role.
 * Must be used after `protect`.
 */
export const authorize = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied, insufficient permissions' });
};
