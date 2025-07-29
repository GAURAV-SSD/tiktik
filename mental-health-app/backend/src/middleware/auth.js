const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { AppError, asyncHandler } = require('./errorHandler');

// Verify JWT token
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new AppError('Access denied. No token provided.', 401, 'AUTH_001');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    
    if (!user) {
      throw new AppError('Token is valid but user no longer exists', 401, 'AUTH_004');
    }

    // Check if user is verified (for features that require verification)
    if (!user.isVerified && req.path !== '/verify-email') {
      throw new AppError('Please verify your email address', 401, 'AUTH_004');
    }

    // Check if doctor is approved
    if (user.role === 'doctor' && !user.isApproved) {
      throw new AppError('Your account is pending approval', 401, 'AUTH_005');
    }

    // Update last active
    user.updateLastActive();

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401, 'AUTH_003');
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401, 'AUTH_002');
    }
    throw error;
  }
});

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Access denied. Authentication required.', 401, 'AUTHZ_001');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Access denied. Insufficient permissions.', 403, 'AUTHZ_001');
    }

    next();
  };
};

// Check if user is approved (for doctors)
const requireApproval = (req, res, next) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, 'AUTHZ_001');
  }

  if (req.user.role === 'doctor' && !req.user.isApproved) {
    throw new AppError('Account pending approval', 403, 'AUTH_005');
  }

  next();
};

// Optional authentication (for public/private content)
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password -refreshTokens');
      
      if (user) {
        user.updateLastActive();
        req.user = user;
      }
    } catch (error) {
      // Ignore token errors for optional auth
      console.log('Optional auth token error:', error.message);
    }
  }

  next();
});

// Check resource ownership
const checkOwnership = (Model, userField = 'user') => {
  return asyncHandler(async (req, res, next) => {
    const resource = await Model.findById(req.params.id);
    
    if (!resource) {
      throw new AppError('Resource not found', 404, 'AUTHZ_002');
    }

    // Allow admins to access any resource
    if (req.user.role === 'admin') {
      req.resource = resource;
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = resource[userField]?.toString();
    const currentUserId = req.user._id.toString();

    if (resourceUserId !== currentUserId) {
      throw new AppError('Access denied. You can only access your own resources.', 403, 'AUTHZ_003');
    }

    req.resource = resource;
    next();
  });
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each user to 3 requests per hour
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: {
    success: false,
    error: {
      code: 'SENSITIVE_OPERATION_LIMIT',
      message: 'Too many sensitive operations. Please try again later.'
    }
  }
});

// Middleware to check if user can perform action on another user
const canInteractWith = (targetUserField = 'targetUserId') => {
  return asyncHandler(async (req, res, next) => {
    const targetUserId = req.params[targetUserField] || req.body[targetUserField];
    
    if (!targetUserId) {
      throw new AppError('Target user ID is required', 400, 'VAL_001');
    }

    const targetUser = await User.findById(targetUserId);
    
    if (!targetUser) {
      throw new AppError('Target user not found', 404, 'AUTHZ_002');
    }

    // Admins can interact with anyone
    if (req.user.role === 'admin') {
      req.targetUser = targetUser;
      return next();
    }

    // Patients can only interact with approved doctors and other patients
    if (req.user.role === 'patient') {
      if (targetUser.role === 'doctor' && !targetUser.isApproved) {
        throw new AppError('Cannot interact with unapproved doctor', 403, 'AUTHZ_003');
      }
    }

    // Doctors can interact with patients and other approved doctors
    if (req.user.role === 'doctor') {
      if (!req.user.isApproved) {
        throw new AppError('Your account is pending approval', 403, 'AUTH_005');
      }
      
      if (targetUser.role === 'doctor' && !targetUser.isApproved) {
        throw new AppError('Cannot interact with unapproved doctor', 403, 'AUTHZ_003');
      }
    }

    req.targetUser = targetUser;
    next();
  });
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  authenticate,
  authorize,
  requireApproval,
  optionalAuth,
  checkOwnership,
  sensitiveOperationLimit,
  canInteractWith,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
};