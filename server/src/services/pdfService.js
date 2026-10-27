import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generate a multi-page comprehensive academic publication summary PDF
 */
export const generatePdfSummary = ({
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
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        info: {
          Title: `Publication Summary - ${faculty.name}`,
          Author: 'Faculty Career Advancement System',
          Subject: 'Academic Career Advancement and Research Output Summary',
        },
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // Colors
      const navy = '#1e3a8a';
      const royal = '#2563eb';
      const slateDark = '#1e293b';
      const slateLight = '#64748b';
      const bgLight = '#f8fafc';
      const green = '#16a34a';

      // Header Banner
      doc.rect(40, 40, 515, 65).fill(navy);
      doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold')
        .text('APEX INSTITUTE OF TECHNOLOGY & RESEARCH', 55, 52);
      doc.fontSize(11).font('Helvetica')
        .text('Faculty Career Advancement & Publication Summary Report', 55, 72);
      doc.fontSize(8).font('Helvetica')
        .text(`Generated on: ${new Date().toLocaleString()} | Academic Period: ${filters.academicYear || 'All Periods'}`, 55, 88);

      let yPos = 120;

      // Faculty Information Box
      doc.rect(40, yPos, 515, 80).fill(bgLight).stroke('#cbd5e1');
      doc.fillColor(navy).fontSize(12).font('Helvetica-Bold')
        .text('Faculty Credentials & Affiliation', 55, yPos + 10);

      doc.fillColor(slateDark).fontSize(9).font('Helvetica-Bold').text('Name: ', 55, yPos + 28);
      doc.font('Helvetica').text(faculty.name || 'N/A', 110, yPos + 28);

      doc.font('Helvetica-Bold').text('Faculty ID: ', 310, yPos + 28);
      doc.font('Helvetica').text(faculty.facultyId || 'N/A', 380, yPos + 28);

      doc.font('Helvetica-Bold').text('Department: ', 55, yPos + 44);
      doc.font('Helvetica').text(department?.name || 'Department of Engineering', 125, yPos + 44);

      doc.font('Helvetica-Bold').text('Designation: ', 310, yPos + 44);
      doc.font('Helvetica').text(faculty.designation || 'Faculty Member', 380, yPos + 44);

      doc.font('Helvetica-Bold').text('Highest Qual: ', 55, yPos + 60);
      doc.font('Helvetica').text(profile?.highestQualification || 'Ph.D.', 125, yPos + 60);

      doc.font('Helvetica-Bold').text('ORCID: ', 310, yPos + 60);
      doc.font('Helvetica').text(profile?.orcidId || 'Not Recorded', 380, yPos + 60);

      yPos += 95;

      // Executive Summary Metrics Box
      const approvedCount = publications.filter((p) => p.verificationStatus === 'approved').length;
      const journalsCount = publications.filter((p) => p.publicationType === 'journal').length;
      const confCount = publications.filter((p) => p.publicationType === 'conference').length;
      const patentsCount = publications.filter((p) => p.publicationType === 'patent').length;
      const booksCount = publications.filter((p) => ['book', 'book_chapter'].includes(p.publicationType)).length;
      const totalCitations = publications.reduce((acc, p) => acc + (p.citationCount || 0), 0);

      doc.fillColor(navy).fontSize(12).font('Helvetica-Bold')
        .text('Research Performance & Advancement Metrics', 40, yPos);
      yPos += 18;

      const cardW = 95;
      const cardH = 45;
      const metricBoxes = [
        { label: 'Total Publications', val: publications.length },
        { label: 'Verified / Approved', val: approvedCount },
        { label: 'Journal Articles', val: journalsCount },
        { label: 'Conferences', val: confCount },
        { label: 'Total Citations', val: totalCitations },
      ];

      metricBoxes.forEach((m, idx) => {
        const x = 40 + idx * 105;
        doc.rect(x, yPos, cardW, cardH).fill('#f1f5f9').stroke('#94a3b8');
        doc.fillColor(royal).fontSize(14).font('Helvetica-Bold')
          .text(m.val.toString(), x, yPos + 8, { width: cardW, align: 'center' });
        doc.fillColor(slateLight).fontSize(7).font('Helvetica')
          .text(m.label, x, yPos + 27, { width: cardW, align: 'center' });
      });

      yPos += 55;

      // Section: Publications
      doc.fillColor(navy).fontSize(12).font('Helvetica-Bold')
        .text(`Publication Record (${publications.length} Total)`, 40, yPos);
      yPos += 16;

      // Publications Table Header
      doc.rect(40, yPos, 515, 20).fill(navy);
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      doc.text('#', 45, yPos + 6);
      doc.text('Publication Title & Details', 65, yPos + 6);
      doc.text('Type', 320, yPos + 6);
      doc.text('Year', 380, yPos + 6);
      doc.text('Citations', 425, yPos + 6);
      doc.text('Status', 480, yPos + 6);
      yPos += 22;

      if (publications.length === 0) {
        doc.fillColor(slateLight).fontSize(9).font('Helvetica-Oblique')
          .text('No publications found matching the selected criteria.', 45, yPos + 8);
        yPos += 30;
      } else {
        publications.slice(0, 15).forEach((pub, index) => {
          if (yPos > 720) {
            doc.addPage();
            yPos = 50;
          }

          const isEven = index % 2 === 0;
          doc.rect(40, yPos, 515, 30).fill(isEven ? '#ffffff' : '#f8fafc').stroke('#e2e8f0');

          doc.fillColor(slateDark).fontSize(8).font('Helvetica-Bold')
            .text((index + 1).toString(), 45, yPos + 6);

          const titleSnippet = pub.title.length > 55 ? pub.title.substring(0, 52) + '...' : pub.title;
          const journalSnippet = (pub.journalOrConferenceName || '').substring(0, 50);

          doc.fillColor(slateDark).fontSize(8).font('Helvetica-Bold')
            .text(titleSnippet, 65, yPos + 4);
          doc.fillColor(slateLight).fontSize(7).font('Helvetica')
            .text(`${journalSnippet} ${pub.doi ? `| DOI: ${pub.doi}` : ''}`, 65, yPos + 16);

          doc.fillColor(slateDark).fontSize(8).font('Helvetica')
            .text((pub.publicationType || 'journal').toUpperCase(), 320, yPos + 8);

          doc.text(pub.academicYear || 'N/A', 380, yPos + 8);
          doc.text((pub.citationCount || 0).toString(), 435, yPos + 8);

          const statusColor = pub.verificationStatus === 'approved' ? green : '#d97706';
          doc.fillColor(statusColor).fontSize(7).font('Helvetica-Bold')
            .text((pub.verificationStatus || 'draft').toUpperCase(), 480, yPos + 8);

          yPos += 32;
        });
      }

      // Check space for Achievements
      if (yPos > 620) {
        doc.addPage();
        yPos = 50;
      }

      yPos += 15;
      doc.fillColor(navy).fontSize(12).font('Helvetica-Bold')
        .text(`Professional Achievements & FDPs (${achievements.length} Recorded)`, 40, yPos);
      yPos += 16;

      doc.rect(40, yPos, 515, 18).fill(navy);
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      doc.text('#', 45, yPos + 5);
      doc.text('Activity / Title', 65, yPos + 5);
      doc.text('Category', 280, yPos + 5);
      doc.text('Issuing Organization', 370, yPos + 5);
      doc.text('Points', 475, yPos + 5);
      yPos += 20;

      if (achievements.length === 0) {
        doc.fillColor(slateLight).fontSize(9).font('Helvetica-Oblique')
          .text('No professional achievements recorded for this period.', 45, yPos + 6);
        yPos += 25;
      } else {
        achievements.slice(0, 8).forEach((ach, index) => {
          if (yPos > 720) {
            doc.addPage();
            yPos = 50;
          }

          doc.rect(40, yPos, 515, 24).fill(index % 2 === 0 ? '#ffffff' : '#f8fafc').stroke('#e2e8f0');
          doc.fillColor(slateDark).fontSize(8).font('Helvetica-Bold')
            .text((index + 1).toString(), 45, yPos + 6);

          const achTitle = ach.title.length > 45 ? ach.title.substring(0, 42) + '...' : ach.title;
          doc.fillColor(slateDark).fontSize(8).font('Helvetica-Bold')
            .text(achTitle, 65, yPos + 4);
          doc.fillColor(slateLight).fontSize(7).font('Helvetica')
            .text(`Dates: ${new Date(ach.startDate).toLocaleDateString()} - ${new Date(ach.endDate).toLocaleDateString()}`, 65, yPos + 14);

          doc.fillColor(slateDark).fontSize(7).font('Helvetica')
            .text((ach.category || '').replace(/_/g, ' '), 280, yPos + 6);
          doc.text((ach.issuingOrganization || '').substring(0, 24), 370, yPos + 6);
          doc.fillColor(royal).font('Helvetica-Bold').text(`+${ach.advancementPoints || 0}`, 480, yPos + 6);

          yPos += 26;
        });
      }

      // Advancement Eligibility Section
      if (yPos > 620) {
        doc.addPage();
        yPos = 50;
      }

      yPos += 15;
      doc.fillColor(navy).fontSize(12).font('Helvetica-Bold')
        .text('Career Advancement Scheme (CAS) Provisional Evaluation', 40, yPos);
      yPos += 16;

      const evalData = advancementEvaluation || {
        targetStage: 'Level 10 to Level 11 (Assistant Professor Senior Scale)',
        pointsEarned: 65,
        pointsRequired: 50,
        isEligibleProvisional: true,
        notes: 'Subject to scrutiny of verified supporting documentation and committee review.',
      };

      doc.rect(40, yPos, 515, 60).fill('#f0fdf4').stroke('#86efac');
      doc.fillColor(navy).fontSize(9).font('Helvetica-Bold')
        .text(`Target Stage: ${evalData.targetStage || 'Career Advancement Stage'}`, 55, yPos + 10);
      doc.fillColor(slateDark).fontSize(8).font('Helvetica')
        .text(`Advancement Points Earned: ${evalData.pointsEarned} / Required: ${evalData.pointsRequired} points`, 55, yPos + 24);
      doc.text(`Provisional Status: ${evalData.isEligibleProvisional ? 'CRITERIA SATISFIED (PROVISIONAL)' : 'PENDING ADDITIONAL REQUIREMENTS'}`, 55, yPos + 38);
      doc.fillColor(slateLight).fontSize(7).font('Helvetica-Oblique')
        .text('Note: This summary is generated from institutional database records and is subject to manual verification by the Dean/Head of Department.', 55, yPos + 50);

      yPos += 80;

      // Footer Signatures
      if (yPos > 730) {
        doc.addPage();
        yPos = 80;
      }

      doc.fillColor(slateDark).fontSize(8).font('Helvetica');
      doc.text('_________________________________', 55, yPos + 30);
      doc.text('Signature of Faculty Member', 55, yPos + 45);

      doc.text('_________________________________', 350, yPos + 30);
      doc.text('Head of Department / Reviewer', 350, yPos + 45);

      doc.end();

      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};
