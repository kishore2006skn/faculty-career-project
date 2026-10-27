import Achievement from '../models/Achievement.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import AdvancementPolicy from '../models/AdvancementPolicy.js';
import { ROLES, VERIFICATION_STATUSES } from '../config/constants.js';
import { logAudit } from '../utils/auditLogger.js';

// @desc    Get achievements with filters
// @route   GET /api/v1/achievements
// @access  Private
export const getAchievements = async (req, res, next) => {
  try {
    const { category, verificationStatus, academicYear, facultyId, department, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (req.user.role === ROLES.FACULTY) {
      if (facultyId && facultyId !== req.user._id.toString()) {
        query.faculty = facultyId;
        query.verificationStatus = VERIFICATION_STATUSES.APPROVED;
      } else {
        query.faculty = req.user._id;
      }
    } else if (req.user.role === ROLES.REVIEWER) {
      if (facultyId) {
        query.faculty = facultyId;
      } else if (department) {
        query.department = department;
      } else if (req.user.department) {
        query.department = req.user.department._id || req.user.department;
      }
    } else if (req.user.role === ROLES.ADMIN) {
      if (facultyId) query.faculty = facultyId;
      if (department) query.department = department;
    }

    if (category) query.category = category;
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (academicYear && academicYear !== 'All') query.academicYear = academicYear;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { issuingOrganization: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Achievement.countDocuments(query);
    const achievements = await Achievement.find(query)
      .populate('faculty', 'name email facultyId')
      .populate('department', 'name code')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: achievements.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      data: achievements,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single achievement
// @route   GET /api/v1/achievements/:id
// @access  Private
export const getAchievementById = async (req, res, next) => {
  try {
    const ach = await Achievement.findById(req.params.id)
      .populate('faculty', 'name email facultyId')
      .populate('department', 'name code');

    if (!ach) {
      return res.status(404).json({ success: false, message: 'Achievement record not found.' });
    }

    return res.status(200).json({ success: true, data: ach });
  } catch (err) {
    next(err);
  }
};

// @desc    Create achievement record
// @route   POST /api/v1/achievements
// @access  Private
export const createAchievement = async (req, res, next) => {
  try {
    let body = { ...req.body };

    if (req.file) {
      body.evidenceFileUrl = `/uploads/${req.file.filename}`;
    }

    body.faculty = req.user._id;
    body.department = req.user.department?._id || req.user.department;

    if (!body.department) {
      return res.status(400).json({
        success: false,
        message: 'Your account must be linked to a department to record achievements.',
      });
    }

    // Lookup scoring policy rule if advancement points not manually set
    if (!body.advancementPoints || body.advancementPoints === 0) {
      const activePolicy = await AdvancementPolicy.findOne({ isActive: true });
      if (activePolicy && activePolicy.criteriaRules) {
        const matchingRule = activePolicy.criteriaRules.find((r) => r.category === body.category);
        if (matchingRule) {
          body.advancementPoints = matchingRule.pointsPerItem;
        } else {
          body.advancementPoints = 5; // Default standard credits
        }
      } else {
        body.advancementPoints = 5;
      }
    }

    const ach = await Achievement.create(body);

    await logAudit({
      actor: req.user,
      action: 'ACHIEVEMENT_CREATED',
      entityType: 'Achievement',
      entityId: ach._id,
      details: { title: ach.title, category: ach.category },
    });

    return res.status(201).json({
      success: true,
      message: 'Achievement recorded successfully.',
      data: ach,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update achievement
// @route   PUT /api/v1/achievements/:id
// @access  Private (Owner or Admin)
export const updateAchievement = async (req, res, next) => {
  try {
    let ach = await Achievement.findById(req.params.id);
    if (!ach) {
      return res.status(404).json({ success: false, message: 'Achievement not found.' });
    }

    const isOwner = ach.faculty.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this achievement record.',
      });
    }

    let updates = { ...req.body };
    if (req.file) {
      updates.evidenceFileUrl = `/uploads/${req.file.filename}`;
    }

    Object.assign(ach, updates);
    await ach.save();

    await logAudit({
      actor: req.user,
      action: 'ACHIEVEMENT_UPDATED',
      entityType: 'Achievement',
      entityId: ach._id,
      details: { title: ach.title },
    });

    return res.status(200).json({
      success: true,
      message: 'Achievement updated successfully.',
      data: ach,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete achievement
// @route   DELETE /api/v1/achievements/:id
// @access  Private (Owner or Admin)
export const deleteAchievement = async (req, res, next) => {
  try {
    const ach = await Achievement.findById(req.params.id);
    if (!ach) {
      return res.status(404).json({ success: false, message: 'Achievement not found.' });
    }

    const isOwner = ach.faculty.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this achievement record.',
      });
    }

    await Achievement.findByIdAndDelete(req.params.id);

    await logAudit({
      actor: req.user,
      action: 'ACHIEVEMENT_DELETED',
      entityType: 'Achievement',
      entityId: req.params.id,
      details: { title: ach.title },
    });

    return res.status(200).json({
      success: true,
      message: 'Achievement deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Review achievement
// @route   POST /api/v1/achievements/:id/review
// @access  Private (Reviewer or Admin)
export const reviewAchievement = async (req, res, next) => {
  try {
    const targetStatus = req.body.status || req.body.decision;
    const { comments, advancementPoints } = req.body;

    const ach = await Achievement.findById(req.params.id);
    if (!ach) {
      return res.status(404).json({ success: false, message: 'Achievement not found.' });
    }

    ach.verificationStatus = targetStatus;
    ach.reviewerComments = comments || '';
    ach.assignedReviewer = req.user._id;
    if (advancementPoints !== undefined) {
      ach.advancementPoints = Number(advancementPoints);
    }
    ach.verificationHistory.push({
      status,
      changedBy: req.user._id,
      comment: comments || '',
      timestamp: new Date(),
    });
    await ach.save();

    await Notification.create({
      recipient: ach.faculty,
      sender: req.user._id,
      title: `Achievement ${status.toUpperCase().replace('_', ' ')}`,
      message: `Your achievement "${ach.title.substring(0, 45)}..." was marked as ${status}. Reviewer comment: "${comments || 'No comment'}"`,
      type: 'achievement_verified',
      link: `/achievements`,
    });

    await logAudit({
      actor: req.user,
      action: `ACHIEVEMENT_REVIEW_${status.toUpperCase()}`,
      entityType: 'Achievement',
      entityId: ach._id,
      details: { status, comments },
    });

    return res.status(200).json({
      success: true,
      message: `Achievement status updated to ${status}.`,
      data: ach,
    });
  } catch (err) {
    next(err);
  }
};
