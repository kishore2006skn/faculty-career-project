import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ROLES, USER_STATUS } from '../config/constants.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check Authorization Bearer header fallback
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to access this resource.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'faculty_advancement_jwt_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).populate('department', 'name code');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user account associated with this session no longer exists.',
      });
    }

    if (user.status === USER_STATUS.DEACTIVATED) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${roles.join(', ')}]. Your current role is '${req.user?.role}'.`,
      });
    }
    next();
  };
};

export const requireActive = (req, res, next) => {
  if (req.user.role !== ROLES.ADMIN && req.user.status !== USER_STATUS.ACTIVE) {
    return res.status(403).json({
      success: false,
      message: 'Account is pending administrator approval before records can be submitted.',
    });
  }
  next();
};
