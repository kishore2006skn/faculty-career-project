import FacultyProfile from '../models/FacultyProfile.js';
import User from '../models/User.js';
import Publication from '../models/Publication.js';
import Achievement from '../models/Achievement.js';
import { ROLES } from '../config/constants.js';
import { logAudit } from '../utils/auditLogger.js';

// @desc    Get all faculty profiles with pagination & filters
// @route   GET /api/v1/faculty
// @access  Private
export const getAllFaculty = async (req, res, next) => {
  try {
    const { search, department, designation, page = 1, limit = 12 } = req.query;

    const query = {};
    if (department) {
      query.department = department;
    }
    if (designation) {
      query.designation = designation;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { facultyId: { $regex: search, $options: 'i' } },
        { officialEmail: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await FacultyProfile.countDocuments(query);
    const facultyList = await FacultyProfile.find(query)
      .populate('user', 'name email role status profilePhotoUrl')
      .populate('department', 'name code')
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort({ fullName: 1 });

    return res.status(200).json({
      success: true,
      count: facultyList.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      data: facultyList,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single faculty profile by User ID or Profile ID
// @route   GET /api/v1/faculty/:id
// @access  Private
export const getFacultyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let profile = await FacultyProfile.findById(id)
      .populate('user', 'name email role status profilePhotoUrl facultyId designation')
      .populate('department', 'name code head');

    if (!profile) {
      profile = await FacultyProfile.findOne({ user: id })
        .populate('user', 'name email role status profilePhotoUrl facultyId designation')
        .populate('department', 'name code head');
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found.',
      });
    }

    // Include statistics summary for profile header
    const userId = profile.user?._id || profile.user;
    const [pubCount, approvedPubCount, achCount] = await Promise.all([
      Publication.countDocuments({ faculty: userId }),
      Publication.countDocuments({ faculty: userId, verificationStatus: 'approved' }),
      Achievement.countDocuments({ faculty: userId }),
    ]);

    // Privacy mask: if not self and not admin/reviewer, hide sensitive phone
    const isSelf = req.user._id.toString() === userId.toString();
    const isPrivileged = [ROLES.ADMIN, ROLES.REVIEWER].includes(req.user.role);

    const profileData = profile.toObject();
    if (!isSelf && !isPrivileged) {
      profileData.phoneNumber = profileData.phoneNumber ? '••••••••••' : '';
    }

    return res.status(200).json({
      success: true,
      data: profileData,
      stats: {
        totalPublications: pubCount,
        approvedPublications: approvedPubCount,
        totalAchievements: achCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update faculty profile
// @route   PUT /api/v1/faculty/:id
// @access  Private (Self or Admin)
export const updateFacultyProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    let profile = await FacultyProfile.findById(id);
    if (!profile) {
      profile = await FacultyProfile.findOne({ user: id });
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found.',
      });
    }

    // Role check: Only the faculty owner or an admin can update
    const isSelf = profile.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update another faculty member’s profile.',
      });
    }

    const updatableFields = [
      'fullName',
      'phoneNumber',
      'designation',
      'dateOfJoining',
      'employmentStatus',
      'highestQualification',
      'specialization',
      'researchInterests',
      'orcidId',
      'googleScholarUrl',
      'scopusId',
      'researchGateUrl',
      'linkedInUrl',
      'biography',
      'experience',
      'coursesTaught',
      'skillsAndCertifications',
    ];

    // Track audit trail changes
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (JSON.stringify(profile[field]) !== JSON.stringify(req.body[field])) {
          profile.auditTrail.push({
            field,
            oldValue: profile[field],
            newValue: req.body[field],
            changedBy: req.user._id,
            changedAt: new Date(),
          });
          profile[field] = req.body[field];
        }
      }
    });

    if (req.body.fullName) {
      await User.findByIdAndUpdate(profile.user, { name: req.body.fullName });
    }
    if (req.body.designation) {
      await User.findByIdAndUpdate(profile.user, { designation: req.body.designation });
    }

    profile.calculateCompletion();
    await profile.save();

    await logAudit({
      actor: req.user,
      action: 'PROFILE_UPDATED',
      entityType: 'FacultyProfile',
      entityId: profile._id,
      details: { updatedFields: Object.keys(req.body) },
    });

    return res.status(200).json({
      success: true,
      message: 'Faculty profile updated successfully.',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload profile photograph
// @route   POST /api/v1/faculty/:id/photo
// @access  Private (Self or Admin)
export const uploadProfilePhoto = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file.',
      });
    }

    let profile = await FacultyProfile.findById(id);
    if (!profile) {
      profile = await FacultyProfile.findOne({ user: id });
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found.',
      });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    profile.profilePhotoUrl = photoUrl;
    profile.calculateCompletion();
    await profile.save();

    await User.findByIdAndUpdate(profile.user, { profilePhotoUrl: photoUrl });

    await logAudit({
      actor: req.user,
      action: 'PROFILE_PHOTO_UPLOADED',
      entityType: 'FacultyProfile',
      entityId: profile._id,
      details: { filename: req.file.filename },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully.',
      photoUrl,
    });
  } catch (err) {
    next(err);
  }
};
