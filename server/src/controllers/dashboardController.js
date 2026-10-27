import Publication from '../models/Publication.js';
import Achievement from '../models/Achievement.js';
import ResearchProject from '../models/ResearchProject.js';
import FacultyProfile from '../models/FacultyProfile.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import AdvancementPolicy from '../models/AdvancementPolicy.js';
import { ROLES, VERIFICATION_STATUSES } from '../config/constants.js';

// @desc    Get dashboard summary statistics
// @route   GET /api/v1/dashboard/summary
// @access  Private
export const getSummaryStats = async (req, res, next) => {
  try {
    const { academicYear, department } = req.query;

    const pubQuery = {};
    const achQuery = {};
    const projQuery = {};

    if (academicYear && academicYear !== 'All') {
      pubQuery.academicYear = academicYear;
      achQuery.academicYear = academicYear;
      projQuery.academicYear = academicYear;
    }

    if (req.user.role === ROLES.FACULTY) {
      pubQuery.faculty = req.user._id;
      achQuery.faculty = req.user._id;
      projQuery.faculty = req.user._id;
    } else if (req.user.role === ROLES.REVIEWER) {
      const deptId = department || req.user.department?._id || req.user.department;
      if (deptId) {
        pubQuery.department = deptId;
        achQuery.department = deptId;
        projQuery.department = deptId;
      }
    } else if (req.user.role === ROLES.ADMIN) {
      if (department) {
        pubQuery.department = department;
        achQuery.department = department;
        projQuery.department = department;
      }
    }

    // Counts from database
    const [
      totalFaculty,
      totalPublications,
      journalCount,
      conferenceCount,
      patentCount,
      booksCount,
      pendingPubs,
      pendingAchs,
      totalAchievements,
      totalProjects,
      allPubsForCitations,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.FACULTY }),
      Publication.countDocuments(pubQuery),
      Publication.countDocuments({ ...pubQuery, publicationType: 'journal' }),
      Publication.countDocuments({ ...pubQuery, publicationType: 'conference' }),
      Publication.countDocuments({ ...pubQuery, publicationType: 'patent' }),
      Publication.countDocuments({
        ...pubQuery,
        publicationType: { $in: ['book', 'book_chapter'] },
      }),
      Publication.countDocuments({
        ...pubQuery,
        verificationStatus: VERIFICATION_STATUSES.SUBMITTED,
      }),
      Achievement.countDocuments({
        ...achQuery,
        verificationStatus: VERIFICATION_STATUSES.SUBMITTED,
      }),
      Achievement.countDocuments(achQuery),
      ResearchProject.countDocuments(projQuery),
      Publication.find(pubQuery, 'citationCount'),
    ]);

    const totalCitations = allPubsForCitations.reduce(
      (sum, p) => sum + (p.citationCount || 0),
      0
    );

    // Calculate advancement score if faculty
    let advancementSummary = null;
    if (req.user.role === ROLES.FACULTY) {
      const activePolicy = await AdvancementPolicy.findOne({ isActive: true });
      const approvedAchs = await Achievement.find({
        faculty: req.user._id,
        verificationStatus: VERIFICATION_STATUSES.APPROVED,
      });
      const pointsEarned = approvedAchs.reduce(
        (sum, a) => sum + (a.advancementPoints || 0),
        0
      );

      const targetStage = activePolicy?.stages?.[0] || {
        stageName: 'Level 10 to Level 11 (Senior Scale)',
        minTotalPoints: 50,
      };

      advancementSummary = {
        policyVersion: activePolicy?.version || 'v1.0',
        stageName: targetStage.stageName,
        pointsEarned,
        pointsRequired: targetStage.minTotalPoints,
        isEligibleProvisional: pointsEarned >= targetStage.minTotalPoints,
      };
    }

    // Recent publications
    const recentPublications = await Publication.find(pubQuery)
      .populate('faculty', 'name facultyId')
      .populate('department', 'code')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        totalFaculty,
        totalPublications,
        journalCount,
        conferenceCount,
        patentCount,
        booksCount,
        totalCitations,
        pendingApprovals: pendingPubs + pendingAchs,
        totalAchievements,
        totalProjects,
        advancementSummary,
        recentPublications,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get publication analytics & chart data
// @route   GET /api/v1/dashboard/charts
// @access  Private
export const getPublicationCharts = async (req, res, next) => {
  try {
    const { department, academicYear } = req.query;
    const matchQuery = {};

    if (academicYear && academicYear !== 'All') {
      matchQuery.academicYear = academicYear;
    }

    if (req.user.role === ROLES.FACULTY) {
      matchQuery.faculty = req.user._id;
    } else if (req.user.role === ROLES.REVIEWER) {
      const deptId = department || req.user.department?._id || req.user.department;
      if (deptId) matchQuery.department = deptId;
    } else if (department) {
      matchQuery.department = department;
    }

    // Publications by Academic Year
    const byYear = await Publication.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$academicYear', count: { $sum: 1 }, citations: { $sum: '$citationCount' } } },
      { $sort: { _id: 1 } },
    ]);

    // Publications by Category
    const byType = await Publication.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$publicationType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Verification Status Breakdown
    const byStatus = await Publication.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
    ]);

    // Department breakdown (for Admin or Reviewer)
    let byDept = [];
    if (req.user.role !== ROLES.FACULTY) {
      byDept = await Publication.aggregate([
        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            as: 'dept',
          },
        },
        { $unwind: '$dept' },
        { $group: { _id: '$dept.code', count: { $sum: 1 }, citations: { $sum: '$citationCount' } } },
        { $sort: { count: -1 } },
      ]);
    }

    return res.status(200).json({
      success: true,
      data: {
        byYear: byYear.map((item) => ({ year: item._id || 'Unknown', count: item.count, citations: item.citations || 0 })),
        byType: byType.map((item) => ({
          type: (item._id || 'other').replace('_', ' ').toUpperCase(),
          count: item.count,
        })),
        byStatus: byStatus.map((item) => ({
          status: (item._id || 'draft').toUpperCase().replace('_', ' '),
          count: item.count,
        })),
        byDepartment: byDept.map((item) => ({ department: item._id, count: item.count, citations: item.citations || 0 })),
      },
    });
  } catch (err) {
    next(err);
  }
};
