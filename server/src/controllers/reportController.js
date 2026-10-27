import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Publication from '../models/Publication.js';
import Achievement from '../models/Achievement.js';
import ResearchProject from '../models/ResearchProject.js';
import FacultyProfile from '../models/FacultyProfile.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import AdvancementPolicy from '../models/AdvancementPolicy.js';
import GeneratedReport from '../models/GeneratedReport.js';
import { ROLES, VERIFICATION_STATUSES } from '../config/constants.js';
import { generatePdfSummary } from '../services/pdfService.js';
import { generateExcelSummary } from '../services/excelService.js';
import { logAudit } from '../utils/auditLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reportsDir = path.join(__dirname, '../../uploads/reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Helper to gather data according to filters
const compileReportData = async (reqBody, user) => {
  const {
    facultyId,
    academicYear,
    categories,
    onlyApproved = false,
    includeAchievements = true,
    includeAdvancement = true,
  } = reqBody;

  // Resolve target faculty
  let targetUserId = user._id;
  if (facultyId && [ROLES.ADMIN, ROLES.REVIEWER].includes(user.role)) {
    targetUserId = facultyId;
  }

  const faculty = await User.findById(targetUserId).populate('department');
  const profile = await FacultyProfile.findOne({ user: targetUserId });
  const department = faculty.department || (profile ? await Department.findById(profile.department) : null);

  // Publications query
  const pubQuery = { faculty: targetUserId };
  if (academicYear && academicYear !== 'All') {
    pubQuery.academicYear = academicYear;
  }
  if (categories && categories.length > 0) {
    pubQuery.publicationType = { $in: categories };
  }
  if (onlyApproved) {
    pubQuery.verificationStatus = VERIFICATION_STATUSES.APPROVED;
  }

  const publications = await Publication.find(pubQuery).sort({ publicationDate: -1 });

  // Achievements query
  let achievements = [];
  if (includeAchievements) {
    const achQuery = { faculty: targetUserId };
    if (academicYear && academicYear !== 'All') {
      achQuery.academicYear = academicYear;
    }
    if (onlyApproved) {
      achQuery.verificationStatus = VERIFICATION_STATUSES.APPROVED;
    }
    achievements = await Achievement.find(achQuery).sort({ startDate: -1 });
  }

  // Research Projects query
  const projQuery = { faculty: targetUserId };
  if (academicYear && academicYear !== 'All') {
    projQuery.academicYear = academicYear;
  }
  const projects = await ResearchProject.find(projQuery).sort({ startDate: -1 });

  // Career Advancement Evaluation
  let advancementEvaluation = null;
  if (includeAdvancement) {
    const policy = await AdvancementPolicy.findOne({ isActive: true });
    const approvedAchs = await Achievement.find({
      faculty: targetUserId,
      verificationStatus: VERIFICATION_STATUSES.APPROVED,
    });

    const pointsEarned = approvedAchs.reduce((acc, a) => acc + (a.advancementPoints || 0), 0);
    const targetStage = policy?.stages?.[0] || {
      stageName: 'Level 10 to Level 11 (Assistant Professor Senior Scale)',
      minTotalPoints: 50,
      minJournalPublications: 2,
    };

    const approvedJournals = publications.filter(
      (p) => p.publicationType === 'journal' && p.verificationStatus === VERIFICATION_STATUSES.APPROVED
    ).length;

    advancementEvaluation = {
      policyName: policy?.policyName || 'Institutional CAS Policy',
      policyVersion: policy?.version || 'v1.0',
      targetStage: targetStage.stageName,
      pointsEarned,
      pointsRequired: targetStage.minTotalPoints,
      approvedJournals,
      journalsRequired: targetStage.minJournalPublications,
      isEligibleProvisional:
        pointsEarned >= targetStage.minTotalPoints && approvedJournals >= (targetStage.minJournalPublications || 0),
      notes:
        'Evaluation is provisional and subject to formal verification of physical documentary evidence and scrutiny committee review.',
    };
  }

  return {
    faculty,
    profile,
    department,
    publications,
    achievements,
    projects,
    advancementEvaluation,
    filters: reqBody,
  };
};

// @desc    Preview publication summary data before export
// @route   POST /api/v1/reports/preview
// @access  Private
export const generateSummaryPreview = async (req, res, next) => {
  try {
    const data = await compileReportData(req.body, req.user);

    const approvedCount = data.publications.filter((p) => p.verificationStatus === 'approved').length;
    const journalsCount = data.publications.filter((p) => p.publicationType === 'journal').length;
    const confCount = data.publications.filter((p) => p.publicationType === 'conference').length;
    const patentsCount = data.publications.filter((p) => p.publicationType === 'patent').length;
    const booksCount = data.publications.filter((p) => ['book', 'book_chapter'].includes(p.publicationType)).length;
    const totalCitations = data.publications.reduce((sum, p) => sum + (p.citationCount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        faculty: {
          name: data.faculty.name,
          facultyId: data.faculty.facultyId,
          email: data.faculty.email,
          designation: data.faculty.designation,
          department: data.department?.name || 'Engineering',
        },
        profile: {
          highestQualification: data.profile?.highestQualification,
          orcidId: data.profile?.orcidId,
          scopusId: data.profile?.scopusId,
          googleScholarUrl: data.profile?.googleScholarUrl,
        },
        summarySnapshot: {
          totalPublications: data.publications.length,
          approvedPublications: approvedCount,
          journalArticles: journalsCount,
          conferencePapers: confCount,
          patents: patentsCount,
          booksOrChapters: booksCount,
          totalCitations,
          totalAchievements: data.achievements.length,
          advancementPointsEarned: data.advancementEvaluation?.pointsEarned || 0,
          advancementStatus: data.advancementEvaluation?.isEligibleProvisional
            ? 'Criteria Satisfied (Provisional)'
            : 'Pending Requirements',
        },
        publications: data.publications,
        achievements: data.achievements,
        projects: data.projects,
        advancementEvaluation: data.advancementEvaluation,
        generatedAt: new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate PDF report
// @route   POST /api/v1/reports/pdf
// @access  Private
export const generatePdfReport = async (req, res, next) => {
  try {
    const data = await compileReportData(req.body, req.user);
    const fileName = `publication_summary_${data.faculty.facultyId}_${Date.now()}.pdf`;
    const outputPath = path.join(reportsDir, fileName);

    await generatePdfSummary({ ...data, outputPath });

    // Save report history in DB
    const reportRecord = await GeneratedReport.create({
      creator: req.user._id,
      faculty: data.faculty._id,
      reportType: 'publication_summary',
      title: `Publication Summary - ${data.faculty.name} (${req.body.academicYear || 'All Periods'})`,
      format: 'pdf',
      fileName,
      fileUrl: `/uploads/reports/${fileName}`,
      filters: req.body,
      summarySnapshot: {
        totalPublications: data.publications.length,
        approvedPublications: data.publications.filter((p) => p.verificationStatus === 'approved').length,
        journalArticles: data.publications.filter((p) => p.publicationType === 'journal').length,
        conferencePapers: data.publications.filter((p) => p.publicationType === 'conference').length,
        patents: data.publications.filter((p) => p.publicationType === 'patent').length,
        totalCitations: data.publications.reduce((sum, p) => sum + (p.citationCount || 0), 0),
        totalAchievements: data.achievements.length,
        advancementPointsEarned: data.advancementEvaluation?.pointsEarned || 0,
        advancementStatus: data.advancementEvaluation?.isEligibleProvisional ? 'Satisfied' : 'Pending',
      },
    });

    await logAudit({
      actor: req.user,
      action: 'REPORT_GENERATED_PDF',
      entityType: 'GeneratedReport',
      entityId: reportRecord._id,
      details: { fileName, facultyId: data.faculty.facultyId },
    });

    // Send file directly for download or return URL
    if (req.query.download === 'true') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.sendFile(outputPath);
    }

    return res.status(200).json({
      success: true,
      message: 'PDF report generated successfully.',
      reportId: reportRecord._id,
      fileName,
      downloadUrl: `/uploads/reports/${fileName}`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate Excel report
// @route   POST /api/v1/reports/excel
// @access  Private
export const generateExcelReport = async (req, res, next) => {
  try {
    const data = await compileReportData(req.body, req.user);
    const fileName = `publication_summary_${data.faculty.facultyId}_${Date.now()}.xlsx`;
    const outputPath = path.join(reportsDir, fileName);

    await generateExcelSummary({ ...data, outputPath });

    const reportRecord = await GeneratedReport.create({
      creator: req.user._id,
      faculty: data.faculty._id,
      reportType: 'publication_summary',
      title: `Publication Summary (Excel) - ${data.faculty.name}`,
      format: 'excel',
      fileName,
      fileUrl: `/uploads/reports/${fileName}`,
      filters: req.body,
      summarySnapshot: {
        totalPublications: data.publications.length,
        approvedPublications: data.publications.filter((p) => p.verificationStatus === 'approved').length,
        journalArticles: data.publications.filter((p) => p.publicationType === 'journal').length,
        conferencePapers: data.publications.filter((p) => p.publicationType === 'conference').length,
        patents: data.publications.filter((p) => p.publicationType === 'patent').length,
        totalCitations: data.publications.reduce((sum, p) => sum + (p.citationCount || 0), 0),
        totalAchievements: data.achievements.length,
        advancementPointsEarned: data.advancementEvaluation?.pointsEarned || 0,
        advancementStatus: data.advancementEvaluation?.isEligibleProvisional ? 'Satisfied' : 'Pending',
      },
    });

    await logAudit({
      actor: req.user,
      action: 'REPORT_GENERATED_EXCEL',
      entityType: 'GeneratedReport',
      entityId: reportRecord._id,
      details: { fileName, facultyId: data.faculty.facultyId },
    });

    if (req.query.download === 'true') {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.sendFile(outputPath);
    }

    return res.status(200).json({
      success: true,
      message: 'Excel report generated successfully.',
      reportId: reportRecord._id,
      fileName,
      downloadUrl: `/uploads/reports/${fileName}`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get generated reports history
// @route   GET /api/v1/reports/history
// @access  Private
export const getReportHistory = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === ROLES.FACULTY) {
      query.creator = req.user._id;
    }

    const reports = await GeneratedReport.find(query)
      .populate('creator', 'name email')
      .populate('faculty', 'name facultyId')
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
};
