import ResearchProject from '../models/ResearchProject.js';
import { ROLES, VERIFICATION_STATUSES } from '../config/constants.js';
import { logAudit } from '../utils/auditLogger.js';

// @desc    Get research projects
// @route   GET /api/v1/research-projects
// @access  Private
export const getResearchProjects = async (req, res, next) => {
  try {
    const { facultyId, department, status, academicYear, search } = req.query;
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

    if (status) query.status = status;
    if (academicYear && academicYear !== 'All') query.academicYear = academicYear;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { fundingAgency: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await ResearchProject.find(query)
      .populate('faculty', 'name email facultyId')
      .populate('department', 'name code')
      .sort({ startDate: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create research project
// @route   POST /api/v1/research-projects
// @access  Private
export const createResearchProject = async (req, res, next) => {
  try {
    let body = { ...req.body };
    if (req.file) {
      body.supportingDocUrl = `/uploads/${req.file.filename}`;
    }

    body.faculty = req.user._id;
    body.department = req.user.department?._id || req.user.department;

    if (!body.department) {
      return res.status(400).json({
        success: false,
        message: 'Your account must be linked to a department to add projects.',
      });
    }

    const project = await ResearchProject.create(body);

    await logAudit({
      actor: req.user,
      action: 'PROJECT_CREATED',
      entityType: 'ResearchProject',
      entityId: project._id,
      details: { title: project.title, grantAmount: project.grantAmount },
    });

    return res.status(201).json({
      success: true,
      message: 'Research project record created successfully.',
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update research project
// @route   PUT /api/v1/research-projects/:id
// @access  Private (Owner or Admin)
export const updateResearchProject = async (req, res, next) => {
  try {
    let project = await ResearchProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isOwner = project.faculty.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    let updates = { ...req.body };
    if (req.file) {
      updates.supportingDocUrl = `/uploads/${req.file.filename}`;
    }

    Object.assign(project, updates);
    await project.save();

    await logAudit({
      actor: req.user,
      action: 'PROJECT_UPDATED',
      entityType: 'ResearchProject',
      entityId: project._id,
      details: { title: project.title },
    });

    return res.status(200).json({
      success: true,
      message: 'Research project updated successfully.',
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete research project
// @route   DELETE /api/v1/research-projects/:id
// @access  Private (Owner or Admin)
export const deleteResearchProject = async (req, res, next) => {
  try {
    const project = await ResearchProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isOwner = project.faculty.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    await ResearchProject.findByIdAndDelete(req.params.id);

    await logAudit({
      actor: req.user,
      action: 'PROJECT_DELETED',
      entityType: 'ResearchProject',
      entityId: req.params.id,
      details: { title: project.title },
    });

    return res.status(200).json({
      success: true,
      message: 'Research project deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
