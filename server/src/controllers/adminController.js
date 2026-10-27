import User from '../models/User.js';
import Department from '../models/Department.js';
import FacultyProfile from '../models/FacultyProfile.js';
import AuditLog from '../models/AuditLog.js';
import AdvancementPolicy from '../models/AdvancementPolicy.js';
import Review from '../models/Review.js';
import Publication from '../models/Publication.js';
import Achievement from '../models/Achievement.js';
import { ROLES, USER_STATUS, VERIFICATION_STATUSES } from '../config/constants.js';
import { logAudit } from '../utils/auditLogger.js';

// @desc    Get all users with filter & search
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const { role, status, department, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (department) query.department = department;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { facultyId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('department', 'name code')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role & status
// @route   PUT /api/v1/admin/users/:id
// @access  Private (Admin)
export const updateUserStatusRole = async (req, res, next) => {
  try {
    const { role, status, department, designation } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deactivating own admin account accidentally
    if (user._id.toString() === req.user._id.toString() && status === USER_STATUS.DEACTIVATED) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account.',
      });
    }

    if (role && Object.values(ROLES).includes(role)) user.role = role;
    if (status && Object.values(USER_STATUS).includes(status)) user.status = status;
    if (department) user.department = department;
    if (designation) user.designation = designation;

    await user.save();

    // Also sync FacultyProfile if department or designation changed
    await FacultyProfile.findOneAndUpdate(
      { user: user._id },
      {
        department: user.department,
        designation: user.designation,
      }
    );

    await logAudit({
      actor: req.user,
      action: 'ADMIN_USER_UPDATED',
      entityType: 'User',
      entityId: user._id,
      details: { role, status, department, designation },
    });

    return res.status(200).json({
      success: true,
      message: 'User account updated successfully.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all departments
// @route   GET /api/v1/admin/departments
// @access  Private
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('head', 'name email facultyId');

    // Attach faculty counts for each department
    const deptsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const facultyCount = await User.countDocuments({
          department: dept._id,
          role: ROLES.FACULTY,
        });
        const pubCount = await Publication.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          facultyCount,
          publicationCount: pubCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: deptsWithCounts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create department
// @route   POST /api/v1/admin/departments
// @access  Private (Admin)
export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, head, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and unique code are required.',
      });
    }

    const dept = await Department.create({
      name,
      code: code.toUpperCase(),
      head: head || null,
      description: description || '',
    });

    await logAudit({
      actor: req.user,
      action: 'DEPARTMENT_CREATED',
      entityType: 'Department',
      entityId: dept._id,
      details: { name, code },
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: dept,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update department
// @route   PUT /api/v1/admin/departments/:id
// @access  Private (Admin)
export const updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    await logAudit({
      actor: req.user,
      action: 'DEPARTMENT_UPDATED',
      entityType: 'Department',
      entityId: dept._id,
      details: req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      data: dept,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get audit logs
// @route   GET /api/v1/admin/audit-logs
// @access  Private (Admin)
export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, page = 1, limit = 25 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get advancement policy
// @route   GET /api/v1/admin/policy
// @access  Private
export const getAdvancementPolicy = async (req, res, next) => {
  try {
    let policy = await AdvancementPolicy.findOne({ isActive: true });
    if (!policy) {
      // Create initial policy if none exists
      policy = await AdvancementPolicy.create({
        policyName: 'UGC-AICTE CAS Framework 2026',
        version: 'v1.0',
        institutionName: 'Apex Institute of Technology & Research',
        criteriaRules: [
          { category: 'journal', label: 'Journal (Scopus/WoS Indexed)', pointsPerItem: 10, minRequiredCount: 2, maxPointsCap: 40 },
          { category: 'conference', label: 'Conference Proceeding (Indexed)', pointsPerItem: 5, minRequiredCount: 2, maxPointsCap: 20 },
          { category: 'patent_filed', label: 'Patent Granted/Published', pointsPerItem: 15, minRequiredCount: 0, maxPointsCap: 30 },
          { category: 'fdp', label: 'Faculty Development Program (>1 week)', pointsPerItem: 10, minRequiredCount: 1, maxPointsCap: 30 },
          { category: 'funded_project', label: 'Funded Research Grant (>5 Lakhs)', pointsPerItem: 20, minRequiredCount: 0, maxPointsCap: 40 },
        ],
        stages: [
          {
            stageName: 'Stage 1 to 2 (Level 10 to Level 11 Assistant Professor)',
            fromDesignation: 'Assistant Professor',
            toDesignation: 'Assistant Professor (Senior Scale)',
            minYearsOfService: 4,
            minTotalPoints: 50,
            minJournalPublications: 2,
            minFdpAttended: 1,
          },
          {
            stageName: 'Stage 2 to 3 (Level 11 to Level 12 Associate Professor)',
            fromDesignation: 'Assistant Professor (Senior Scale)',
            toDesignation: 'Associate Professor',
            minYearsOfService: 5,
            minTotalPoints: 80,
            minJournalPublications: 4,
            minFdpAttended: 2,
          },
        ],
      });
    }

    return res.status(200).json({ success: true, data: policy });
  } catch (err) {
    next(err);
  }
};

// @desc    Update advancement policy
// @route   PUT /api/v1/admin/policy/:id
// @access  Private (Admin)
export const updateAdvancementPolicy = async (req, res, next) => {
  try {
    const policy = await AdvancementPolicy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found.' });
    }

    await logAudit({
      actor: req.user,
      action: 'ADVANCEMENT_POLICY_UPDATED',
      entityType: 'AdvancementPolicy',
      entityId: policy._id,
      details: { policyName: policy.policyName, version: policy.version },
    });

    return res.status(200).json({
      success: true,
      message: 'Career advancement policy updated successfully.',
      data: policy,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get review queue (Pending Publications & Achievements)
// @route   GET /api/v1/admin/review-queue
// @access  Private (Reviewer or Admin)
export const getReviewQueue = async (req, res, next) => {
  try {
    const pubQuery = { verificationStatus: { $in: [VERIFICATION_STATUSES.SUBMITTED, VERIFICATION_STATUSES.UNDER_REVIEW] } };
    const achQuery = { verificationStatus: { $in: [VERIFICATION_STATUSES.SUBMITTED, VERIFICATION_STATUSES.UNDER_REVIEW] } };

    // If reviewer, restrict to department
    if (req.user.role === ROLES.REVIEWER && req.user.department) {
      const deptId = req.user.department._id || req.user.department;
      pubQuery.department = deptId;
      achQuery.department = deptId;
    }

    const [pendingPublications, pendingAchievements] = await Promise.all([
      Publication.find(pubQuery)
        .populate('faculty', 'name email facultyId')
        .populate('department', 'name code')
        .sort({ updatedAt: -1 }),
      Achievement.find(achQuery)
        .populate('faculty', 'name email facultyId')
        .populate('department', 'name code')
        .sort({ updatedAt: -1 }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        publications: pendingPublications,
        achievements: pendingAchievements,
        totalPending: pendingPublications.length + pendingAchievements.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
