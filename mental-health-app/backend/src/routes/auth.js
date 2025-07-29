const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { 
  authenticate, 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  sensitiveOperationLimit 
} = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .isIn(['patient', 'doctor'])
    .withMessage('Role must be either patient or doctor'),
  body('username')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be between 2 and 50 characters'),
  
  // Doctor-specific validations
  body('profile.specialization')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Specialization is required for doctors'),
  body('profile.experience')
    .if(body('role').equals('doctor'))
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),
  body('doctorInfo.medicalLicense')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Medical license is required for doctors'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VAL_001');
  }

  const { email, password, role, username, profile, patientInfo, doctorInfo } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400, 'BIZ_001');
  }

  // Create user data
  const userData = {
    email,
    password,
    role,
    username: role === 'patient' ? undefined : username, // Auto-generate for patients
    profile: profile || {},
    isVerified: false
  };

  // Add role-specific data
  if (role === 'patient') {
    userData.patientInfo = patientInfo || {};
  } else if (role === 'doctor') {
    userData.doctorInfo = doctorInfo || {};
    userData.isApproved = false; // Doctors need approval
  }

  // Create user
  const user = await User.create(userData);

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    await emailService.sendVerificationEmail(user.email, verificationToken);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't fail registration if email fails
  }

  // Generate tokens
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to user
  user.refreshTokens.push({ token: refreshToken });
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email for verification.',
    data: {
      user: user.publicProfile,
      tokens: {
        accessToken,
        refreshToken
      }
    },
    timestamp: new Date().toISOString()
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VAL_001');
  }

  const { email, password } = req.body;

  // Check if user exists and get password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'AUTH_001');
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new AppError('Invalid email or password', 401, 'AUTH_001');
  }

  // Generate tokens
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to user
  user.refreshTokens.push({ token: refreshToken });
  await user.save({ validateBeforeSave: false });

  // Update last active
  user.updateLastActive();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.publicProfile,
      tokens: {
        accessToken,
        refreshToken
      }
    },
    timestamp: new Date().toISOString()
  });
}));

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400, 'VAL_001');
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user and check if refresh token exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('Invalid refresh token', 401, 'AUTH_003');
    }

    const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
    if (!tokenExists) {
      throw new AppError('Invalid refresh token', 401, 'AUTH_003');
    }

    // Generate new tokens
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AppError('Invalid refresh token', 401, 'AUTH_003');
    }
    throw error;
  }
}));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Remove specific refresh token
    req.user.refreshTokens = req.user.refreshTokens.filter(t => t.token !== refreshToken);
  } else {
    // Remove all refresh tokens (logout from all devices)
    req.user.refreshTokens = [];
  }

  req.user.isOnline = false;
  await req.user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString()
  });
}));

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Verification token is required', 400, 'VAL_001');
  }

  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400, 'AUTH_003');
  }

  // Verify user
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  // Award points for email verification
  const pointsResult = user.addPoints(10);
  if (pointsResult.levelUp) {
    user.addBadge({
      name: 'Email Verified',
      description: 'Successfully verified email address',
      icon: '✅'
    });
  }

  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully',
    data: {
      user: user.publicProfile,
      pointsAwarded: 10,
      levelUp: pointsResult.levelUp
    },
    timestamp: new Date().toISOString()
  });
}));

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', sensitiveOperationLimit, asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400, 'VAL_001');
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      timestamp: new Date().toISOString()
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  // Send reset email
  try {
    await emailService.sendPasswordResetEmail(user.email, resetToken);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    throw new AppError('Failed to send password reset email', 500, 'EMAIL_001');
  }

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
    timestamp: new Date().toISOString()
  });
}));

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', sensitiveOperationLimit, asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError('Token and new password are required', 400, 'VAL_001');
  }

  if (newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400, 'VAL_003');
  }

  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400, 'AUTH_003');
  }

  // Set new password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  // Invalidate all refresh tokens (force re-login)
  user.refreshTokens = [];

  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful. Please log in with your new password.',
    timestamp: new Date().toISOString()
  });
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.publicProfile
    },
    timestamp: new Date().toISOString()
  });
}));

module.exports = router;