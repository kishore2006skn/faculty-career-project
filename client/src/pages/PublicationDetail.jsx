import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  Edit3,
  Send,
  FileCheck2,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Quote,
  ShieldCheck,
  Calendar,
  Building2,
  Layers,
  MessageSquare,
  XCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDecision, setReviewDecision] = useState('approved');
  const [reviewComments, setReviewComments] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Submit Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchPublication();
  }, [id]);

  const fetchPublication = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/publications/${id}`);
      if (res.data?.success) {
        setPublication(res.data.data);
      }
    } catch (err) {
      showToast('Publication not found.', 'error');
      navigate('/publications');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await api.post(`/publications/${id}/review`, {
        decision: reviewDecision,
        comments: reviewComments,
      });
      showToast(`Publication status updated to ${reviewDecision}.`, 'success');
      setShowReviewModal(false);
      fetchPublication();
    } catch (err) {
      showToast(err.response?.data?.message || 'Review action failed.', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitLoading(true);
    try {
      await api.post(`/publications/${id}/submit`);
      showToast('Publication successfully submitted for review.', 'success');
      setShowSubmitModal(false);
      fetchPublication();
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading publication details..." />;
  }

  if (!publication) return null;

  const isOwner =
    publication.faculty?._id === user?._id || publication.faculty === user?._id;
  const isReviewerOrAdmin = user?.role === 'admin' || user?.role === 'reviewer';
  const canEdit =
    user?.role === 'admin' ||
    (isOwner && ['draft', 'needs_correction'].includes(publication.verificationStatus));
  const canSubmit =
    isOwner && ['draft', 'needs_correction'].includes(publication.verificationStatus);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/publications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-600 dark:text-royal-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Publications
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canSubmit && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Submit for Review
            </button>
          )}

          {canEdit && (
            <Link
              to={`/publications/${publication._id}/edit`}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Record
            </Link>
          )}

          {isReviewerOrAdmin && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5" /> Review / Scrutinize
            </button>
          )}
        </div>
      </div>

      {/* Main Publication Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusBadge status={publication.verificationStatus} />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-royal-100 text-royal-700 dark:bg-royal-950/60 dark:text-royal-300 capitalize">
              {publication.publicationType?.replace('_', ' ')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono">
              Academic Year: {publication.academicYear}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {publication.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-royal-700 dark:text-royal-400">
            <span>{publication.journalOrConferenceName}</span>
            {publication.publisher && <span>• Publisher: {publication.publisher}</span>}
            {publication.publicationDate && (
              <span>• Date: {new Date(publication.publicationDate).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Abstract */}
        {publication.abstract && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Abstract
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {publication.abstract}
            </p>
          </div>
        )}

        {/* Authors Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Author Contributions ({publication.authors?.length || 0})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {publication.authors?.map((author, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{author.name}</span>
                  {author.isCorresponding && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-royal-100 text-royal-700 rounded">
                      Corr. Author
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{author.affiliation}</p>
                {author.contributionRole && (
                  <p className="text-[11px] text-royal-600 dark:text-royal-400 mt-1 font-medium">
                    {author.contributionRole}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Volume / Issue / Pages</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Vol. {publication.volume || '-'}, No. {publication.issue || '-'}, pp.{' '}
              {publication.pageNumbers || '-'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">ISSN / ISBN</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {publication.issnOrIsbn || 'Not provided'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Recorded Citations</span>
            <span className="font-bold text-royal-600 dark:text-royal-400 text-sm">
              {publication.citationCount || 0}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Source: {publication.citationSource || 'Manual'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">DOI</span>
            {publication.doi ? (
              <a
                href={`https://doi.org/${publication.doi}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1 truncate"
              >
                {publication.doi} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <span className="text-slate-400">None</span>
            )}
          </div>
        </div>

        {/* Indexing Badges */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300">Verified Indexing:</span>
          {publication.indexingStatus?.isScopus ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Scopus Indexed ({publication.indexingStatus.quartile || 'Unranked'})
            </span>
          ) : null}
          {publication.indexingStatus?.isWoS ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-royal-50 text-royal-700 border border-royal-200">
              Web of Science (WoS)
            </span>
          ) : null}
          {publication.indexingStatus?.isPeerReviewed ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Peer-Reviewed Journal / Conference
            </span>
          ) : null}
        </div>

        {/* Supporting Evidence File */}
        {publication.supportingDocUrl && (
          <div className="flex items-center justify-between p-4 bg-royal-50/50 dark:bg-royal-950/30 rounded-2xl border border-royal-200/60 dark:border-royal-800/60">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-royal-600" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Documentary Evidence Uploaded
                </p>
                <p className="text-[11px] text-slate-500">
                  Paper reprint, certificate, or publication acceptance letter.
                </p>
              </div>
            </div>
            <a
              href={publication.supportingDocUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-royal-600 text-white rounded-xl text-xs font-bold hover:bg-royal-700 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download Document
            </a>
          </div>
        )}
      </div>

      {/* Review & Audit History Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-royal-600" /> Scrutiny History & Reviewer Decisions
        </h3>

        {publication.reviewHistory?.length > 0 ? (
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            {publication.reviewHistory.map((item, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-royal-600 ring-4 ring-white dark:ring-slate-900"></span>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold capitalize text-slate-800 dark:text-slate-200">
                      Decision: {item.decision?.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.reviewedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Reviewer: {item.reviewer?.name || 'Department Committee'}
                  </p>
                  {item.comments && (
                    <div className="mt-2 p-2 bg-white dark:bg-slate-900 rounded-xl text-slate-700 dark:text-slate-300 font-medium border border-slate-200/60 dark:border-slate-800">
                      "{item.comments}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            No formal review decisions recorded yet. Record is currently in {publication.verificationStatus} state.
          </p>
        )}
      </div>

      {/* Review Action Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Review Publication Submission
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Scrutinize publication proof, indexing veracity, and authorize promotional credit.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Evaluation Decision *
                </label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="approved">Approve & Verify for CAS</option>
                  <option value="needs_correction">Request Corrections from Faculty</option>
                  <option value="rejected">Reject Submission</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Scrutiny Comments & Feedback
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Provide detailed feedback or reasons for this decision..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-xl shadow-md"
                >
                  {reviewLoading ? 'Submitting...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      <ConfirmModal
        isOpen={showSubmitModal}
        title="Submit for Verification"
        message="Submit this publication for official scrutiny by the Department Head and Academic Review Committee?"
        confirmText="Confirm & Submit"
        isLoading={submitLoading}
        onConfirm={handleSubmitForReview}
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
};

export default PublicationDetail;
