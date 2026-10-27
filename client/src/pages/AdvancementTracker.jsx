import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Award,
  ShieldCheck,
  FileText,
  Sliders,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdvancementTracker = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [policy, setPolicy] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvancementData();
  }, []);

  const fetchAdvancementData = async () => {
    setLoading(true);
    try {
      const [polRes, achRes, pubRes] = await Promise.all([
        api.get('/admin/policy'),
        api.get('/achievements', { params: { faculty: user?._id } }),
        api.get('/publications', { params: { faculty: user?._id } }),
      ]);

      if (polRes.data?.success) setPolicy(polRes.data.data);
      if (achRes.data?.success) setAchievements(achRes.data.data);
      if (pubRes.data?.success) setPublications(resData(pubRes.data));
    } catch (err) {
      showToast('Failed to load advancement metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resData = (d) => (Array.isArray(d?.data) ? d.data : []);

  if (loading) {
    return <LoadingSpinner text="Evaluating Career Advancement Scheme (CAS) metrics..." />;
  }

  // Calculate scores
  const approvedAchievements = achievements.filter((a) => a.verificationStatus === 'approved');
  const pendingAchievements = achievements.filter((a) => a.verificationStatus === 'submitted');
  const pointsEarned = approvedAchievements.reduce((sum, a) => sum + (a.advancementPoints || 0), 0);
  const pointsPending = pendingAchievements.reduce((sum, a) => sum + (a.advancementPoints || 0), 0);

  const approvedJournals = publications.filter(
    (p) => p.publicationType === 'journal' && p.verificationStatus === 'approved'
  );
  const pendingJournals = publications.filter(
    (p) => p.publicationType === 'journal' && p.verificationStatus === 'submitted'
  );

  const approvedFDPs = approvedAchievements.filter((a) =>
    ['fdp', 'workshop'].includes(a.category)
  );

  // Target stage
  const currentStage = policy?.stages?.[0] || {
    stageName: 'Level 10 to Level 11 (Assistant Professor Senior Scale)',
    minTotalPoints: 50,
    minJournalPublications: 2,
    minFdpDays: 10,
    requiredYearsInGrade: 4,
  };

  const pointsPercent = Math.min(100, Math.round((pointsEarned / currentStage.minTotalPoints) * 100));
  const journalsPercent = Math.min(
    100,
    Math.round((approvedJournals.length / currentStage.minJournalPublications) * 100)
  );

  const isEligible =
    pointsEarned >= currentStage.minTotalPoints &&
    approvedJournals.length >= currentStage.minJournalPublications;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-50 dark:bg-royal-950/60 text-royal-700 dark:text-royal-300 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Institutional CAS Policy: {policy?.policyName || 'Standard CAS Policy'} (
          {policy?.version || 'v1.0'})
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Career Advancement Scheme (CAS) Eligibility Tracker
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time progression dashboard for academic promotions, API credit scoring, and mandatory publication quotas.
        </p>
      </div>

      {/* Provisional Notice Alert */}
      <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold">Important Institutional Notice:</span> Career advancement calculations shown here are provisional and generated dynamically from verified database records. Final eligibility is determined after physical document verification and scrutiny committee review in accordance with college ordinances.
        </p>
      </div>

      {/* Target Stage Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Evaluation Target
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              {currentStage.stageName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Applicable for: {user?.designation} • {user?.department?.name || 'Department'}
            </p>
          </div>

          <div className="shrink-0">
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                isEligible
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isEligible ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              {isEligible ? 'Provisional Criteria Satisfied' : 'Requirements in Progress'}
            </span>
          </div>
        </div>

        {/* Progress Bars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Advancement Points Requirement */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                1. CAS Advancement Score
              </span>
              <span className="text-xs font-mono font-bold text-royal-600 dark:text-royal-400">
                {pointsEarned} / {currentStage.minTotalPoints} pts
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  pointsPercent >= 100 ? 'bg-emerald-500' : 'bg-royal-600'
                }`}
                style={{ width: `${pointsPercent}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{pointsPercent}% completed</span>
              {pointsPending > 0 && (
                <span className="text-amber-600 font-semibold">
                  +{pointsPending} pts under review
                </span>
              )}
            </div>
          </div>

          {/* Mandatory Journal Publications */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                2. Scopus/Peer-Reviewed Journals
              </span>
              <span className="text-xs font-mono font-bold text-royal-600 dark:text-royal-400">
                {approvedJournals.length} / {currentStage.minJournalPublications} papers
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  journalsPercent >= 100 ? 'bg-emerald-500' : 'bg-royal-600'
                }`}
                style={{ width: `${journalsPercent}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{journalsPercent}% completed</span>
              {pendingJournals.length > 0 && (
                <span className="text-amber-600 font-semibold">
                  +{pendingJournals.length} papers in review
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Mandatory CAS Criteria Checklist
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              {approvedJournals.length >= currentStage.minJournalPublications ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-slate-800 dark:text-white">
                  Minimum {currentStage.minJournalPublications} Verified Journal Publications in UGC Care / Scopus
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Currently verified: {approvedJournals.length} papers.
                  {approvedJournals.length < currentStage.minJournalPublications &&
                    ` Missing ${currentStage.minJournalPublications - approvedJournals.length} papers.`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              {pointsEarned >= currentStage.minTotalPoints ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-slate-800 dark:text-white">
                  Cumulative Institutional Advancement Score ({currentStage.minTotalPoints} Points)
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Current score: {pointsEarned} points.
                  {pointsEarned < currentStage.minTotalPoints &&
                    ` Need ${currentStage.minTotalPoints - pointsEarned} more points through FDPs, consultancies, or awards.`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              {approvedFDPs.length > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-slate-800 dark:text-white">
                  Participation in Refresher Courses / AICTE-approved Faculty Development Programs
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Verified FDPs and workshops attended: {approvedFDPs.length} events.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            Generate an official appraisal summary report for the scrutiny committee.
          </p>
          <Link
            to="/generate-summary"
            className="inline-flex items-center gap-2 px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-royal-600/20"
          >
            <FileText className="w-4 h-4" /> Generate Appraisal Summary
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdvancementTracker;
