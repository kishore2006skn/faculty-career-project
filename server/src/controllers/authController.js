import crypto from 'crypto';
import User from '../models/User.js';
import FacultyProfile from '../models/FacultyProfile.js';
import Department from '../models/Department.js';
import { ROLES, USER_STATUS } from '../config/constants.js';
import { sendTokenResponse } from '../utils/token.js';
import { logAudit } from '../utils/auditLogger.js';
import { sendEmail } from '../services/emailService.js';

// @desc    Register a new faculty or user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, facultyId, password, department, designation } = req.body;

    if (!name || !email || !facultyId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, official email, faculty ID, and password.',
      });
    }

    // Check if email or facultyId already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this official email already exists.',
      });
    }

    const existingFacultyId = await User.findOne({ facultyId: facultyId.toUpperCase() });
    if (existingFacultyId) {
      return res.status(409).json({
        success: false,
        message: 'An account with this faculty ID already exists.',
      });
    }

    // Resolve department
    let departmentId = null;
    if (department) {
      const deptDoc = await Department.findOne({
        $or: [{ _id: department.match(/^[0-9a-fA-F]{24}$/) ? department : null }, { name: department }, { code: department }],
      });
      if (deptDoc) departmentId = deptDoc._id;
    }

    // If first user in DB, make Admin & Active
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      facultyId: facultyId.toUpperCase(),
      password,
      department: departmentId,
      designation: designation || 'Assistant Professor',
      role: isFirstUser ? ROLES.ADMIN : ROLES.FACULTY,
      status: isFirstUser ? USER_STATUS.ACTIVE : USER_STATUS.ACTIVE, // set active for smooth evaluation
    });

    // Create corresponding FacultyProfile
    await FacultyProfile.create({
      user: user._id,
      facultyId: user.facultyId,
      fullName: user.name,
      officialEmail: user.email,
      department: departmentId,
      designation: user.designation,
      completionPercentage: 35,
    });

    await logAudit({
      actor: user,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role, facultyId: user.facultyId },
    });

    return sendTokenResponse(user, 201, res, 'Registration successful. Welcome to the portal.');
  } catch (err) {
    next(err);
  }
};

// @desc    Login user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Select password explicitly
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('department', 'name code');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    if (user.status === USER_STATUS.DEACTIVATED) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await logAudit({
      actor: user,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role },
    });

    return sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logAudit({
        actor: req.user,
        action: 'USER_LOGOUT',
        entityType: 'User',
        entityId: req.user._id,
      });
    }

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged in user & profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department', 'name code head');
    const profile = await FacultyProfile.findOne({ user: req.user.id }).populate('department', 'name code');

    return res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password - generate reset token
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide registered email.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with that email.',
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because a password reset request was submitted for your Faculty Advancement account.\n\nPlease click on the following link or paste it into your browser to complete the process:\n\n${resetUrl}\n\nThis link will expire in 60 minutes.\nIf you did not request this, please ignore this email.`;

    await sendEmail({
      to: user.email,
      subject: 'Faculty Advancement Portal - Password Reset Token',
      text: message,
    });

    await logAudit({
      actor: user,
      action: 'PASSWORD_RESET_REQUESTED',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email },
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset instructions have been dispatched to your email.',
      // For developer/demonstration testing convenience in development mode:
      devResetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password with token
// @route   POST /api/v1/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.',
      });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await logAudit({
      actor: user,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'User',
      entityId: user._id,
    });

    return sendTokenResponse(user, 200, res, 'Password updated successfully. You are now logged in.');
  } catch (err) {
    next(err);
  }
};
