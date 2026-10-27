import Publication from '../models/Publication.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { ROLES, VERIFICATION_STATUSES } from '../config/constants.js';
import { lookupCrossrefDoi } from '../services/externalApiService.js';
import { logAudit } from '../utils/auditLogger.js';

// @desc    Get publications with filters, search & pagination
// @route   GET /api/v1/publications
// @access  Private
export const getPublications = async (req, res, next) => {
  try {
    const {
      search,
      publicationType,
      verificationStatus,
      academicYear,
      department,
      facultyId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Role-based visibility
    if (req.user.role === ROLES.FACULTY) {
      // Faculty members see their own publications, or only approved ones if viewing others
      if (facultyId && facultyId !== req.user._id.toString()) {
        query.faculty = facultyId;
        query.verificationStatus = VERIFICATION_STATUSES.APPROVED;
      } else {
        query.faculty = req.user._id;
      }
    } else if (req.user.role === ROLES.REVIEWER) {
      // Reviewers can see their department records
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

    if (publicationType) query.publicationType = publicationType;
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (academicYear && academicYear !== 'All') query.academicYear = academicYear;

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { journalOrConferenceName: searchRegex },
        { doi: searchRegex },
        { 'authors.name': searchRegex },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Publication.countDocuments(query);
    const publications = await Publication.find(query)
      .populate('faculty', 'name email facultyId')
      .populate('department', 'name code')
      .populate('assignedReviewer', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: publications.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      data: publications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single publication
// @route   GET /api/v1/publications/:id
// @access  Private
export const getPublicationById = async (req, res, next) => {
  try {
    const pub = await Publication.findById(req.params.id)
      .populate('faculty', 'name email facultyId designation')
      .populate('department', 'name code')
      .populate('assignedReviewer', 'name email')
      .populate('verificationHistory.changedBy', 'name role');

    if (!pub) {
      return res.status(404).json({ success: false, message: 'Publication not found.' });
    }

    return res.status(200).json({ success: true, data: pub });
  } catch (err) {
    next(err);
  }
};

// @desc    Create publication
// @route   POST /api/v1/publications
// @access  Private
export const createPublication = async (req, res, next) => {
  try {
    let body = { ...req.body };

    // Parse JSON fields if sent via FormData (with file upload)
    if (typeof body.authors === 'string') {
      try {
        body.authors = JSON.parse(body.authors);
      } catch (e) {
        body.authors = [];
      }
    }
    if (typeof body.keywords === 'string') {
      try {
        body.keywords = JSON.parse(body.keywords);
      } catch (e) {
        body.keywords = body.keywords.split(',').map((k) => k.trim()).filter(Boolean);
      }
    }
    if (typeof body.indexingDetails === 'string') {
      try {
        body.indexingDetails = JSON.parse(body.indexingDetails);
      } catch (e) {
        body.indexingDetails = {};
      }
    }

    if (req.file) {
      body.supportingDocUrl = `/uploads/${req.file.filename}`;
    }

    // Set faculty owner and department
    body.faculty = req.user._id;
    body.department = req.user.department?._id || req.user.department;

    if (!body.department) {
      return res.status(400).json({
        success: false,
        message: 'Your user profile must be associated with a Department to submit publications.',
      });
    }

    // Duplicate detection check
    const normalized = (body.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();

    if (body.doi) {
      const existingDoi = await Publication.findOne({
        doi: body.doi.trim(),
        faculty: req.user._id,
      });
      if (existingDoi) {
        return res.status(409).json({
          success: false,
          message: 'A publication with this exact DOI already exists in your records.',
        });
      }
    }

    const existingTitle = await Publication.findOne({
      normalizedTitle: normalized,
      faculty: req.user._id,
    });
    if (existingTitle) {
      return res.status(409).json({
        success: false,
        message: 'A publication with this same title already exists in your records.',
      });
    }

    const pub = await Publication.create(body);

    await logAudit({
      actor: req.user,
      action: 'PUBLICATION_CREATED',
      entityType: 'Publication',
      entityId: pub._id,
      details: { title: pub.title, type: pub.publicationType, doi: pub.doi },
    });

    return res.status(201).json({
      success: true,
      message: 'Publication saved successfully.',
      data: pub,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update publication
// @route   PUT /api/v1/publications/:id
// @access  Private (Owner or Admin)
export const updatePublication = async (req, res, next) => {
  try {
    let pub = await Publication.findById(req.params.id);
    if (!pub) {
      return res.status(404).json({ success: false, message: 'Publication not found.' });
    }

    const isOwner = pub.faculty.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this publication.',
      });
    }

    // Once approved, non-admins cannot arbitrarily edit without reopening review
    if (pub.verificationStatus === VERIFICATION_STATUSES.APPROVED && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Approved publications cannot be edited directly. Please contact your reviewer.',
      });
    }

    let updates = { ...req.body };

    if (typeof updates.authors === 'string') {
      try {
        updates.authors = JSON.parse(updates.authors);
      } catch (e) {}
    }
    if (typeof updates.keywords === 'string') {
      try {
        updates.keywords = JSON.parse(updates.keywords);
      } catch (e) {}
    }
    if (typeof updates.indexingDetails === 'string') {
      try {
        updates.indexingDetails = JSON.parse(updates.indexingDetails);
      } catch (e) {}
    }

    if (req.file) {
      updates.supportingDocUrl = `/uploads/${req.file.filename}`;
    }

    Object.assign(pub, updates);
    await pub.save();

    await logAudit({
      actor: req.user,
      action: 'PUBLICATION_UPDATED',
      entityType: 'Publication',
      entityId: pub._id,
      details: { title: pub.title },
    });

    return res.status(200).json({
      success: true,
      message: 'Publication updated successfully.',
      data: pub,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete publication
// @route   DELETE /api/v1/publications/:id
// @access  Private (Owner or Admin)
export const deletePublication = async (req, res, next) => {
  try {
    const pub = await Publication.findById(req.params.id);
    if (!pub) {
      return res.status(404).json({ success: false, message: 'Publication not found.' });
    }

    const isOwner = pub.faculty.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this publication.',
      });
    }

    if (pub.verificationStatus === VERIFICATION_STATUSES.APPROVED && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Approved publications cannot be deleted. Contact your administrator.',
      });
    }

    await Publication.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ targetType: 'Publication', targetId: req.params.id });

    await logAudit({
      actor: req.user,
      action: 'PUBLICATION_DELETED',
      entityType: 'Publication',
      entityId: req.params.id,
      details: { title: pub.title },
    });

    return res.status(200).json({
      success: true,
      message: 'Publication removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit publication for institutional review
// @route   POST /api/v1/publications/:id/submit
// @access  Private (Owner)
export const submitForReview = async (req, res, next) => {
  try {
    const pub = await Publication.findById(req.params.id);
    if (!pub) {
      return res.status(404).json({ success: false, message: 'Publication not found.' });
    }

    if (pub.faculty.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only the author may submit this publication for review.',
      });
    }

    pub.verificationStatus = VERIFICATION_STATUSES.SUBMITTED;
    pub.verificationHistory.push({
      status: VERIFICATION_STATUSES.SUBMITTED,
      changedBy: req.user._id,
      comment: 'Submitted for institutional verification',
      timestamp: new Date(),
    });
    await pub.save();

    // Create or update review record
    await Review.findOneAndUpdate(
      { targetType: 'Publication', targetId: pub._id },
      {
        targetType: 'Publication',
        targetId: pub._id,
        title: pub.title,
        faculty: pub.faculty,
        department: pub.department,
        status: VERIFICATION_STATUSES.SUBMITTED,
        decision: 'pending',
        $push: {
          history: {
            status: VERIFICATION_STATUSES.SUBMITTED,
            reviewer: req.user._id,
            comment: 'Submission received',
            timestamp: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );

    // Notify Reviewers / HODs in department
    const reviewers = await User.find({
      role: { $in: [ROLES.REVIEWER, ROLES.ADMIN] },
      $or: [{ department: pub.department }, { role: ROLES.ADMIN }],
    });

    for (const r of reviewers) {
      await Notification.create({
        recipient: r._id,
        sender: req.user._id,
        title: 'New Publication Submitted for Review',
        message: `${req.user.name} submitted "${pub.title.substring(0, 50)}..." for verification.`,
        type: 'publication_submitted',
        link: `/reviews`,
      });
    }

    await logAudit({
      actor: req.user,
      action: 'PUBLICATION_SUBMITTED',
      entityType: 'Publication',
      entityId: pub._id,
      details: { title: pub.title },
    });

    return res.status(200).json({
      success: true,
      message: 'Publication submitted for review successfully.',
      data: pub,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Review / Approve / Reject / Request correction on publication
// @route   POST /api/v1/publications/:id/review
// @access  Private (Reviewer or Admin)
export const reviewPublication = async (req, res, next) => {
  try {
    const targetStatus = req.body.status || req.body.decision;
    const { comments } = req.body;

    if (![VERIFICATION_STATUSES.APPROVED, VERIFICATION_STATUSES.REJECTED, VERIFICATION_STATUSES.NEEDS_CORRECTION].includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review status. Must be approved, rejected, or needs_correction.',
      });
    }

    const pub = await Publication.findById(req.params.id);
    if (!pub) {
      return res.status(404).json({ success: false, message: 'Publication not found.' });
    }

    pub.verificationStatus = targetStatus;
    pub.reviewerComments = comments || '';
    pub.assignedReviewer = req.user._id;
    pub.verificationHistory.push({
      status: targetStatus,
      changedBy: req.user._id,
      comment: comments || '',
      timestamp: new Date(),
    });
    await pub.save();

    await Review.findOneAndUpdate(
      { targetType: 'Publication', targetId: pub._id },
      {
        status: targetStatus,
        decision: targetStatus === VERIFICATION_STATUSES.APPROVED ? 'approved' : targetStatus === VERIFICATION_STATUSES.REJECTED ? 'rejected' : 'needs_correction',
        comments: comments || '',
        assignedReviewer: req.user._id,
        reviewedAt: new Date(),
        $push: {
          history: {
            status: targetStatus,
            reviewer: req.user._id,
            comment: comments || '',
            timestamp: new Date(),
          },
        },
      },
      { upsert: true }
    );

    // Notify author
    await Notification.create({
      recipient: pub.faculty,
      sender: req.user._id,
      title: `Publication ${status.toUpperCase().replace('_', ' ')}`,
      message: `Your publication "${pub.title.substring(0, 45)}..." was marked as ${status}. Reviewer comment: "${comments || 'No comment'}"`,
      type: status === VERIFICATION_STATUSES.APPROVED ? 'publication_approved' : status === VERIFICATION_STATUSES.REJECTED ? 'publication_rejected' : 'publication_correction',
      link: `/publications/${pub._id}`,
    });

    await logAudit({
      actor: req.user,
      action: `PUBLICATION_REVIEW_${status.toUpperCase()}`,
      entityType: 'Publication',
      entityId: pub._id,
      details: { status, comments },
    });

    return res.status(200).json({
      success: true,
      message: `Publication review completed: ${status}`,
      data: pub,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lookup DOI using Crossref API
// @route   GET /api/v1/publications/doi-lookup
// @access  Private
export const lookupDoi = async (req, res, next) => {
  try {
    const { doi } = req.query;
    if (!doi) {
      return res.status(400).json({ success: false, message: 'DOI query parameter is required.' });
    }

    const result = await lookupCrossrefDoi(doi);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (err) {
    next(err);
  }
};

// @desc    Pre-check for duplicate publication
// @route   POST /api/v1/publications/check-duplicate
// @access  Private
export const checkDuplicate = async (req, res, next) => {
  try {
    const { title, doi } = req.body;
    let duplicate = null;

    if (doi) {
      duplicate = await Publication.findOne({
        doi: doi.trim(),
        faculty: req.user._id,
      });
      if (duplicate) {
        return res.status(200).json({
          isDuplicate: true,
          matchType: 'DOI',
          publication: duplicate,
        });
      }
    }

    if (title) {
      const normalized = title.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
      duplicate = await Publication.findOne({
        normalizedTitle: normalized,
        faculty: req.user._id,
      });
      if (duplicate) {
        return res.status(200).json({
          isDuplicate: true,
          matchType: 'Title',
          publication: duplicate,
        });
      }
    }

    return res.status(200).json({ isDuplicate: false });
  } catch (err) {
    next(err);
  }
};
