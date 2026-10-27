import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Building2,
  Users,
  CheckCircle,
  FileCheck2,
  Sparkles,
  BookOpen,
  Award,
  Briefcase,
  TrendingUp,
  Quote,
  Printer,
  History,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORIES = [
  { id: 'journal', label: 'Journal Articles' },
  { id: 'conference', label: 'Conference Papers' },
  { id: 'book', label: 'Books' },
  { id: 'book_chapter', label: 'Book Chapters' },
  { id: 'patent', label: 'Patents' },
  { id: 'review_paper', label: 'Review Papers' },
];

const GenerateSummary = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(user?._id || '');
  const [academicYear, setAcademicYear] = useState('All');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([
    'journal',
    'conference',
    'book',
    'book_chapter',
    'patent',
    'review_paper',
  ]);
  const [includeAchievements, setIncludeAchievements] = useState(true);
  const [includeAdvancement, setIncludeAdvancement] = useState(true);
  const [onlyApproved, setOnlyApproved] = useState(false);
  const [reportTemplate, setReportTemplate] = useState('academic_standard');

  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  useEffect(() => {
    if (user?.role !== 'faculty') {
      fetchFacultyAndDepartments();
    }
  }, [user]);

  const fetchFacultyAndDepartments = async () => {
    try {
      const [facRes, deptRes] = await Promise.all([
        api.get('/faculty'),
        api.get('/admin/departments'),
      ]);
      if (facRes.data?.success) setFacultyList(facRes.data.data);
      if (deptRes.data?.success) setDepartments(deptRes.data.data);
    } catch (e) {}
  };

  const toggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) return; // Keep at least 1
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleGeneratePreview = async () => {
    setPreviewLoading(true);
    try {
      const payload = {
        facultyId: selectedFaculty || user?._id,
        academicYear,
        categories: selectedCategories,
        onlyApproved,
        includeAchievements,
        includeAdvancement,
        template: reportTemplate,
      };

      const res = await api.post('/reports/preview', payload);
      if (res.data?.success) {
        setPreviewData(res.data.data);
        showToast('Publication summary compiled successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate preview.', 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const payload = {
        facultyId: selectedFaculty || user?._id,
        academicYear,
        categories: selectedCategories,
        onlyApproved,
        includeAchievements,
        includeAdvancement,
        template: reportTemplate,
      };

      const res = await api.post('/reports/pdf?download=true', payload, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Publication_Summary_${academicYear}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('PDF summary downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to download PDF summary.', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    try {
      const payload = {
        facultyId: selectedFaculty || user?._id,
        academicYear,
        categories: selectedCategories,
        onlyApproved,
        includeAchievements,
        includeAdvancement,
      };

      const res = await api.post('/reports/excel?download=true', payload, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Publication_Summary_${academicYear}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('Excel workbook exported successfully!', 'success');
    } catch (err) {
      showToast('Failed to download Excel summary.', 'error');
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-royal-600" />
            Automatic Publication Summary Generator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Produce certified academic dossiers, year-wise publication tables, and CAS appraisal summaries.
          </p>
        </div>

        <Link
          to="/reports/history"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
        >
          <History className="w-3.5 h-3.5" /> Report History
        </Link>
      </div>

      {/* Configuration Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-royal-700 dark:text-royal-400">
          Report Parameters & Scope
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          {/* Target Faculty (If Admin/Reviewer) */}
          {user?.role !== 'faculty' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Faculty Member
              </label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value={user?._id}>Me ({user?.name})</option>
                {facultyList.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.facultyId} - {f.department?.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Academic Session */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reporting Academic Session
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
            >
              <option value="All">All Recorded Academic Years</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
            </select>
          </div>

          {/* Template Style */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Report Template Format
            </label>
            <select
              value={reportTemplate}
              onChange={(e) => setReportTemplate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
            >
              <option value="academic_standard">Institutional Comprehensive Dossier</option>
              <option value="cas_appraisal">Career Advancement (CAS) Promotion Format</option>
              <option value="executive_brief">Executive Research Brief (1-Page Summary)</option>
            </select>
          </div>
        </div>

        {/* Publication Categories Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Included Publication Categories
          </label>
          <div className="flex flex-wrap gap-2 text-xs">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                    isSelected
                      ? 'bg-royal-600 text-white border-royal-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <label className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyApproved}
              onChange={(e) => setOnlyApproved(e.target.checked)}
              className="rounded text-royal-600"
            />
            <span>Include Only Approved / Verified Records</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAchievements}
              onChange={(e) => setIncludeAchievements(e.target.checked)}
              className="rounded text-royal-600"
            />
            <span>Include Professional Achievements & FDPs</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAdvancement}
              onChange={(e) => setIncludeAdvancement(e.target.checked)}
              className="rounded text-royal-600"
            />
            <span>Include CAS Promotion Progress Evaluation</span>
          </label>
        </div>

        {/* Generation Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleGeneratePreview}
            disabled={previewLoading}
            className="px-6 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-royal-600/20 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Eye className="w-4 h-4" />
            {previewLoading ? 'Compiling Preview...' : 'Generate Live Preview'}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {downloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}
            </button>

            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={downloadingExcel}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {downloadingExcel ? 'Exporting Excel...' : 'Export Excel Workbook'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Pane */}
      {previewData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10 space-y-8 animate-fadeIn">
          {/* Institutional Report Header */}
          <div className="border-b-2 border-royal-700 pb-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6">
            <div>
              <span className="text-[10px] font-black tracking-widest text-royal-600 uppercase block">
                APEX INSTITUTE OF TECHNOLOGY & RESEARCH
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Faculty Research & Publication Summary
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Reporting Period: {academicYear === 'All' ? 'All Recorded Years' : academicYear} • Generated on{' '}
                {new Date(previewData.generatedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-4 sm:mt-0 bg-royal-50 dark:bg-royal-950/60 p-3.5 rounded-2xl border border-royal-200 dark:border-royal-800 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                {previewData.faculty?.name}
              </span>
              <span className="text-royal-600 dark:text-royal-400 font-semibold block">
                {previewData.faculty?.designation} ({previewData.faculty?.facultyId})
              </span>
              <span className="text-[11px] text-slate-500 block">
                {previewData.faculty?.department}
              </span>
            </div>
          </div>

          {/* KPI Snapshot Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Executive Research Metrics Snapshot
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 block text-[11px]">Total Publications</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {previewData.summarySnapshot?.totalPublications}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  {previewData.summarySnapshot?.approvedPublications} Approved & Verified
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 block text-[11px]">Journals & Conferences</span>
                <span className="text-2xl font-black text-royal-600 dark:text-royal-400 mt-1 block">
                  {previewData.summarySnapshot?.journalArticles +
                    previewData.summarySnapshot?.conferencePapers}
                </span>
                <span className="text-[10px] text-slate-500">
                  {previewData.summarySnapshot?.journalArticles} Journals •{' '}
                  {previewData.summarySnapshot?.conferencePapers} Conf
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 block text-[11px]">Recorded Citations</span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">
                  {previewData.summarySnapshot?.totalCitations}
                </span>
                <span className="text-[10px] text-slate-500">Scopus & Google Scholar Indexed</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 block text-[11px]">CAS Promotion Status</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-2 block">
                  {previewData.summarySnapshot?.advancementStatus}
                </span>
                <span className="text-[10px] text-royal-600 font-semibold">
                  {previewData.summarySnapshot?.advancementPointsEarned} Advancement Points
                </span>
              </div>
            </div>
          </div>

          {/* Publications Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Detailed Publications Roster ({previewData.publications?.length || 0})
            </h3>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-3 px-3.5">#</th>
                    <th className="py-3 px-3.5">Title & Venue</th>
                    <th className="py-3 px-3.5">Type</th>
                    <th className="py-3 px-3.5">Year</th>
                    <th className="py-3 px-3.5">Indexing & DOI</th>
                    <th className="py-3 px-3.5">Citations</th>
                    <th className="py-3 px-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {previewData.publications?.map((pub, idx) => (
                    <tr key={pub._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3.5 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3.5 max-w-sm">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {pub.title}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {pub.journalOrConferenceName || pub.publisher}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 capitalize font-semibold text-slate-700">
                        {pub.publicationType?.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px]">{pub.academicYear}</td>
                      <td className="py-3 px-3.5">
                        {pub.indexingStatus?.isScopus ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Scopus {pub.indexingStatus.quartile || ''}
                          </span>
                        ) : pub.indexingStatus?.isWoS ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-royal-50 text-royal-700 border border-royal-200">
                            WoS
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Standard</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-800">
                        {pub.citationCount || 0}
                      </td>
                      <td className="py-3 px-3.5">
                        <StatusBadge status={pub.verificationStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Professional Achievements Section */}
          {previewData.achievements?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Professional Achievements & FDPs ({previewData.achievements.length})
              </h3>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 uppercase">
                      <th className="py-3 px-3.5">Title</th>
                      <th className="py-3 px-3.5">Category</th>
                      <th className="py-3 px-3.5">Organization</th>
                      <th className="py-3 px-3.5">Session</th>
                      <th className="py-3 px-3.5">Points</th>
                      <th className="py-3 px-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {previewData.achievements.map((ach) => (
                      <tr key={ach._id}>
                        <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                          {ach.title}
                        </td>
                        <td className="py-3 px-3.5 capitalize font-medium text-slate-700">
                          {ach.category?.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-3.5 text-slate-500">{ach.issuingOrganization}</td>
                        <td className="py-3 px-3.5 font-mono text-[11px]">{ach.academicYear}</td>
                        <td className="py-3 px-3.5 font-bold text-royal-600">
                          {ach.advancementPoints || 0} pts
                        </td>
                        <td className="py-3 px-3.5">
                          <StatusBadge status={ach.verificationStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Career Advancement Evaluation Box */}
          {previewData.advancementEvaluation && (
            <div className="p-5 bg-royal-50/60 dark:bg-royal-950/30 rounded-2xl border border-royal-200 dark:border-royal-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-royal-900 dark:text-royal-200">
                  CAS Promotion Scrutiny Evaluation (Provisional)
                </span>
                <span className="font-mono text-[11px] text-royal-600">
                  {previewData.advancementEvaluation.policyName} (
                  {previewData.advancementEvaluation.policyVersion})
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Target Stage: <span className="font-bold">{previewData.advancementEvaluation.targetStage}</span>.
                Scored <span className="font-bold">{previewData.advancementEvaluation.pointsEarned} points</span> (Required: {previewData.advancementEvaluation.pointsRequired}), with{' '}
                <span className="font-bold">{previewData.advancementEvaluation.approvedJournals} verified journals</span> (Required: {previewData.advancementEvaluation.journalsRequired}).
              </p>
              <p className="text-[11px] text-slate-400 italic">
                {previewData.advancementEvaluation.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerateSummary;
