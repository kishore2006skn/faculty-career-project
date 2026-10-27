import Facility from '../models/Facility.js';
import { ROLES } from '../config/constants.js';
import { logAudit } from '../utils/auditLogger.js';

// @desc    Get all research facilities / labs
// @route   GET /api/v1/facilities
// @access  Private
export const getFacilities = async (req, res, next) => {
  try {
    const { department, status, search } = req.query;
    const query = {};

    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { facilityCode: { $regex: search, $options: 'i' } },
        { researchDomains: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const facilities = await Facility.find(query)
      .populate('department', 'name code')
      .populate('facultyInCharge', 'name email facultyId designation')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get facility by ID
// @route   GET /api/v1/facilities/:id
// @access  Private
export const getFacilityById = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id)
      .populate('department', 'name code')
      .populate('facultyInCharge', 'name email facultyId designation profilePhotoUrl');

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility record not found.' });
    }

    return res.status(200).json({
      success: true,
      data: facility,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new facility
// @route   POST /api/v1/facilities
// @access  Private (Admin or Reviewer)
export const createFacility = async (req, res, next) => {
  try {
    const facility = await Facility.create(req.body);

    await logAudit({
      actor: req.user,
      action: 'FACILITY_CREATED',
      entityType: 'Facility',
      entityId: facility._id,
      details: { name: facility.name, code: facility.facilityCode },
    });

    const populated = await Facility.findById(facility._id)
      .populate('department', 'name code')
      .populate('facultyInCharge', 'name email facultyId');

    return res.status(201).json({
      success: true,
      message: 'Research facility registered successfully.',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update facility
// @route   PUT /api/v1/facilities/:id
// @access  Private (Admin, Reviewer, or Coordinator)
export const updateFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found.' });
    }

    const isCoordinator = facility.facultyInCharge.toString() === req.user._id.toString();
    const isAuthorized = req.user.role === ROLES.ADMIN || req.user.role === ROLES.REVIEWER || isCoordinator;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this research facility.',
      });
    }

    const updated = await Facility.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('department', 'name code')
      .populate('facultyInCharge', 'name email facultyId');

    await logAudit({
      actor: req.user,
      action: 'FACILITY_UPDATED',
      entityType: 'Facility',
      entityId: updated._id,
      details: { name: updated.name },
    });

    return res.status(200).json({
      success: true,
      message: 'Facility details updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete facility
// @route   DELETE /api/v1/facilities/:id
// @access  Private (Admin only)
export const deleteFacility = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only institutional administrators may delete a research facility.',
      });
    }

    const facility = await Facility.findByIdAndDelete(req.params.id);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found.' });
    }

    await logAudit({
      actor: req.user,
      action: 'FACILITY_DELETED',
      entityType: 'Facility',
      entityId: facility._id,
      details: { name: facility.name },
    });

    return res.status(200).json({
      success: true,
      message: 'Facility record deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
