import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  BookOpen,
  Award,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  MessageSquare,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PublicationReviewQueue = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('publications');
  const [queue, setQueue] = useState({ publications: [], achievements: [] });
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState('publication'); // 'publication' | 'achievement'
  const [decision, setDecision] = useState('approved');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviewQueue();
    fetchDepartments();
  }, [selectedDept]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      if (res.data?.success) setDepartments(res.data.data);
    } catch (e) {}
  };

  const fetchReviewQueue = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDept) params.department = selectedDept;

      const res = await api.get('/admin/review-queue', { params });
      if (res.data?.success) {
        setQueue(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load review queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setDecision('approved');
    setComments('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      if (itemType === 'publication') {
        await api.post(`/publications/${selectedItem._id}/review`, {
          decision,
          comments,
        });
      } else {
        await api.post(`/achievements/${selectedItem._id}/review`, {
          decision,
          comments,
        });
      }

      showToast(`Submission successfully marked as ${decision}.`, 'success');
      setSelectedItem(null);
      fetchReviewQueue();
    } catch (err) {
      showToast(err.response?.data?.message || 'Review action failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingPubs = queue.publications || [];
  const pendingAchs = queue.achievements || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-royal-600" />
            Peer Review & Scrutiny Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Departmental verification of research outputs, indexing proofs, and promotional CAS claims.
          </p>
        </div>

        {departments.length > 0 && user?.role === 'admin' && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('publications')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'publications'
              ? 'border-royal-600 text-royal-600 dark:text-royal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Pending Publications
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-royal-100 dark:bg-royal-950/60 text-royal-700 dark:text-royal-300">
            {pendingPubs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'achievements'
              ? 'border-royal-600 text-royal-600 dark:text-royal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          Pending Achievements & FDPs
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            {pendingAchs.length}
          </span>
        </button>
      </div>

      {/* Content Section */}
      {loading ? (
        <LoadingSpinner text="Loading submissions for review..." />
      ) : activeTab === 'publications' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {pendingPubs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All research publication submissions have been scrutinized! Queue is clean.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Publication Title & Venue</th>
                    <th className="py-3.5 px-4">Faculty Member</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 px-4">Indexing Claim</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingPubs.map((pub) => (
                    <tr
                      key={pub._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-4 max-w-sm">
                        <Link
                          to={`/publications/${pub._id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-royal-600 block line-clamp-1"
                        >
                          {pub.title}
                        </Link>
                        <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                          {pub.journalOrConferenceName || pub.publisher}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {pub.faculty?.name}
                        <span className="text-[10px] text-slate-400 block">
                          {pub.faculty?.department?.code}
                        </span>
                      </td>

                      <td className="py-4 px-4 capitalize font-medium text-slate-600">
                        {pub.publicationType?.replace('_', ' ')}
                      </td>

                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(pub.updatedAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-4">
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

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/publications/${pub._id}`}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 inline mr-1" /> View
                          </Link>
                          <button
                            onClick={() => openReviewModal(pub, 'publication')}
                            className="px-3 py-1.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl font-bold shadow-sm"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Achievements Queue */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {pendingAchs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All faculty achievement and FDP submissions have been evaluated!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Achievement Title</th>
                    <th className="py-3.5 px-4">Faculty Member</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Claimed Points</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingAchs.map((ach) => (
                    <tr
                      key={ach._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white max-w-sm">
                        {ach.title}
                        <span className="text-[11px] text-slate-400 block font-normal mt-0.5">
                          {ach.issuingOrganization}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {ach.faculty?.name}
                      </td>

                      <td className="py-4 px-4 capitalize font-medium text-slate-600">
                        {ach.category?.replace('_', ' ')}
                      </td>

                      <td className="py-4 px-4 font-bold text-royal-600 dark:text-royal-400">
                        {ach.advancementPoints || 0} pts
                      </td>

                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(ach.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => openReviewModal(ach, 'achievement')}
                          className="px-3 py-1.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl font-bold shadow-sm"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Scrutiny Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Scrutinize Submission
            </h3>
            <p className="text-xs text-slate-500 mb-4 line-clamp-1 font-semibold">
              "{selectedItem.title}"
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Verification Decision *
                </label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="approved">Approve & Award Full CAS Credit</option>
                  <option value="needs_correction">Request Corrections from Faculty</option>
                  <option value="rejected">Reject Submission</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Scrutiny Comments & Official Rationale *
                </label>
                <textarea
                  rows={3}
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="State clear reasons or documentary verification checks..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-xl shadow-md"
                >
                  {submitting ? 'Saving...' : 'Record Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationReviewQueue;
