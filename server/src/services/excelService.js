import ExcelJS from 'exceljs';

/**
 * Generate a multi-sheet Excel summary report for faculty publications and achievements
 */
export const generateExcelSummary = async ({
  faculty,
  profile,
  department,
  publications = [],
  achievements = [],
  projects = [],
  advancementEvaluation = null,
  filters = {},
  outputPath,
}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Faculty Advancement System';
  workbook.created = new Date();

  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' }, // Navy blue
  };
  const headerFont = {
    name: 'Arial',
    color: { argb: 'FFFFFFFF' },
    bold: true,
    size: 11,
  };

  // ---------------- SHEET 1: SUMMARY ----------------
  const summarySheet = workbook.addWorksheet('Executive Summary');
  summarySheet.columns = [
    { header: 'Property', key: 'prop', width: 28 },
    { header: 'Value / Details', key: 'val', width: 50 },
  ];

  summarySheet.getRow(1).fill = headerFill;
  summarySheet.getRow(1).font = headerFont;

  const approvedPubs = publications.filter((p) => p.verificationStatus === 'approved').length;
  const journalPubs = publications.filter((p) => p.publicationType === 'journal').length;
  const confPubs = publications.filter((p) => p.publicationType === 'conference').length;
  const patentsCount = publications.filter((p) => p.publicationType === 'patent').length;
  const booksCount = publications.filter((p) => ['book', 'book_chapter'].includes(p.publicationType)).length;
  const totalCitations = publications.reduce((acc, p) => acc + (p.citationCount || 0), 0);

  const summaryData = [
    { prop: 'Institution', val: 'Apex Institute of Technology & Research' },
    { prop: 'Report Type', val: 'Faculty Career Advancement & Publication Summary' },
    { prop: 'Generation Date', val: new Date().toLocaleString() },
    { prop: 'Academic Period Filter', val: filters.academicYear || 'All Academic Years' },
    { prop: 'Faculty Member Name', val: faculty.name },
    { prop: 'Faculty ID', val: faculty.facultyId },
    { prop: 'Official Email', val: faculty.email },
    { prop: 'Department', val: department?.name || 'Department of Engineering' },
    { prop: 'Designation', val: faculty.designation },
    { prop: 'Highest Qualification', val: profile?.highestQualification || 'Ph.D.' },
    { prop: 'ORCID Identifier', val: profile?.orcidId || 'N/A' },
    { prop: 'Scopus Author ID', val: profile?.scopusId || 'N/A' },
    { prop: 'Google Scholar URL', val: profile?.googleScholarUrl || 'N/A' },
    { prop: 'Total Publications Count', val: publications.length },
    { prop: 'Verified / Approved Publications', val: approvedPubs },
    { prop: 'Peer-Reviewed Journals', val: journalPubs },
    { prop: 'Conference Proceedings', val: confPubs },
    { prop: 'Patents Filed / Granted', val: patentsCount },
    { prop: 'Books & Chapters', val: booksCount },
    { prop: 'Total Recorded Citations', val: totalCitations },
    { prop: 'Professional Achievements / FDPs', val: achievements.length },
    { prop: 'Sponsored Projects & Grants', val: projects.length },
    { prop: 'Advancement Points Accumulated', val: advancementEvaluation?.pointsEarned || 0 },
    { prop: 'Provisional Eligibility', val: advancementEvaluation?.isEligibleProvisional ? 'Eligible (Subject to Committee Review)' : 'Pending Requirements' },
  ];

  summaryData.forEach((row) => summarySheet.addRow(row));

  // ---------------- SHEET 2: PUBLICATIONS ----------------
  const pubSheet = workbook.addWorksheet('Publications');
  pubSheet.columns = [
    { header: '#', key: 'idx', width: 6 },
    { header: 'Title', key: 'title', width: 45 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Journal / Venue Name', key: 'venue', width: 32 },
    { header: 'Academic Year', key: 'year', width: 14 },
    { header: 'DOI', key: 'doi', width: 24 },
    { header: 'ISSN/ISBN', key: 'isbn', width: 16 },
    { header: 'Citations', key: 'citations', width: 10 },
    { header: 'Scopus Indexed', key: 'scopus', width: 14 },
    { header: 'WoS Indexed', key: 'wos', width: 14 },
    { header: 'Verification Status', key: 'status', width: 18 },
  ];
  pubSheet.getRow(1).fill = headerFill;
  pubSheet.getRow(1).font = headerFont;

  publications.forEach((p, idx) => {
    pubSheet.addRow({
      idx: idx + 1,
      title: p.title,
      category: (p.publicationType || '').toUpperCase(),
      venue: p.journalOrConferenceName,
      year: p.academicYear,
      doi: p.doi || '-',
      isbn: p.isbnIssn || '-',
      citations: p.citationCount || 0,
      scopus: p.indexingDetails?.isScopus ? 'Yes' : 'No',
      wos: p.indexingDetails?.isWoS ? 'Yes' : 'No',
      status: (p.verificationStatus || 'draft').toUpperCase(),
    });
  });

  // ---------------- SHEET 3: ACHIEVEMENTS & FDPS ----------------
  const achSheet = workbook.addWorksheet('Achievements & FDPs');
  achSheet.columns = [
    { header: '#', key: 'idx', width: 6 },
    { header: 'Title / Program Name', key: 'title', width: 40 },
    { header: 'Category', key: 'category', width: 22 },
    { header: 'Issuing Organization', key: 'org', width: 30 },
    { header: 'Academic Year', key: 'year', width: 14 },
    { header: 'Start Date', key: 'start', width: 14 },
    { header: 'End Date', key: 'end', width: 14 },
    { header: 'Advancement Points', key: 'points', width: 18 },
    { header: 'Status', key: 'status', width: 16 },
  ];
  achSheet.getRow(1).fill = headerFill;
  achSheet.getRow(1).font = headerFont;

  achievements.forEach((a, idx) => {
    achSheet.addRow({
      idx: idx + 1,
      title: a.title,
      category: a.category,
      org: a.issuingOrganization,
      year: a.academicYear,
      start: a.startDate ? new Date(a.startDate).toLocaleDateString() : '-',
      end: a.endDate ? new Date(a.endDate).toLocaleDateString() : '-',
      points: a.advancementPoints || 0,
      status: (a.verificationStatus || 'draft').toUpperCase(),
    });
  });

  // ---------------- SHEET 4: RESEARCH PROJECTS ----------------
  const projSheet = workbook.addWorksheet('Research Projects');
  projSheet.columns = [
    { header: '#', key: 'idx', width: 6 },
    { header: 'Project Title', key: 'title', width: 40 },
    { header: 'Type', key: 'type', width: 18 },
    { header: 'Funding Agency', key: 'agency', width: 25 },
    { header: 'Grant Amount (INR)', key: 'amount', width: 20 },
    { header: 'Role', key: 'role', width: 24 },
    { header: 'Academic Year', key: 'year', width: 14 },
    { header: 'Status', key: 'status', width: 14 },
  ];
  projSheet.getRow(1).fill = headerFill;
  projSheet.getRow(1).font = headerFont;

  projects.forEach((prj, idx) => {
    projSheet.addRow({
      idx: idx + 1,
      title: prj.title,
      type: prj.projectType,
      agency: prj.fundingAgency,
      amount: prj.grantAmount || 0,
      role: prj.roleInProject,
      year: prj.academicYear,
      status: (prj.status || 'ongoing').toUpperCase(),
    });
  });

  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
};
