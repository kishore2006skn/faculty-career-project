import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  FileCheck2,
  Trash2,
  Edit3,
  ExternalLink,
  Send,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PublicationList = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [publications, setPublications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [publicationType, setPublicationType] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [facultyFilter, setFacultyFilter] = useState(searchParams.get('faculty') || '');

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Submit modal state
  const [submitId, setSubmitId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchPublications();
  }, [page, publicationType, academicYear, verificationStatus, facultyFilter]);

  const fetchPublications = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
      };
      if (search.trim()) params.search = search.trim();
      if (publicationType) params.publicationType = publicationType;
      if (academicYear) params.academicYear = academicYear;
      if (verificationStatus) params.verificationStatus = verificationStatus;
      if (facultyFilter) params.faculty = facultyFilter;

      const res = await api.get('/publications', { params });
      if (res.data?.success) {
        setPublications(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      showToast('Failed to load publications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPublications();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/publications/${deleteId}`);
      showToast('Publication deleted successfully.', 'success');
      setDeleteId(null);
      fetchPublications();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete publication.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!submitId) return;
    setSubmitLoading(true);
    try {
      await api.post(`/publications/${submitId}/submit`);
      showToast('Publication submitted for peer review!', 'success');
      setSubmitId(null);
      fetchPublications();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit publication.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Research Publications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage peer-reviewed articles, conferences, patents, and scholarly monographs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/publications/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-royal-600/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Add Publication
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by publication title, DOI, or keywords..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500 text-slate-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold rounded-xl hover:bg-slate-900"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Publication Type */}
          <select
            value={publicationType}
            onChange={(e) => {
              setPublicationType(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="">All Publication Types</option>
            <option value="journal">Journal Articles</option>
            <option value="conference">Conference Papers</option>
            <option value="book">Books</option>
            <option value="book_chapter">Book Chapters</option>
            <option value="patent">Patents</option>
            <option value="review_paper">Review Papers</option>
          </select>

          {/* Academic Year */}
          <select
            value={academicYear}
            onChange={(e) => {
              setAcademicYear(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="">All Academic Years</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2022-2023">2022-2023</option>
          </select>

          {/* Verification Status */}
          <select
            value={verificationStatus}
            onChange={(e) => {
              setVerificationStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="needs_correction">Needs Correction</option>
            <option value="rejected">Rejected</option>
          </select>

          {(publicationType || academicYear || verificationStatus || search || facultyFilter) && (
            <button
              onClick={() => {
                setPublicationType('');
                setAcademicYear('');
                setVerificationStatus('');
                setSearch('');
                setFacultyFilter('');
                setPage(1);
              }}
              className="text-royal-600 dark:text-royal-400 font-semibold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Publications Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading publications..." />
        ) : publications.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No publications match your criteria.
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add a new publication or change your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Publication Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Faculty</th>
                  <th className="py-3.5 px-4">Indexing</th>
                  <th className="py-3.5 px-4">Citations</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {publications.map((pub) => {
                  const isOwner = pub.faculty?._id === user?._id || pub.faculty === user?._id;
                  const canEdit =
                    user?.role === 'admin' ||
                    (isOwner && ['draft', 'needs_correction'].includes(pub.verificationStatus));
                  const canSubmit =
                    isOwner && ['draft', 'needs_correction'].includes(pub.verificationStatus);

                  return (
                    <tr
                      key={pub._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Title & Venue */}
                      <td className="py-4 px-4 max-w-md">
                        <Link
                          to={`/publications/${pub._id}`}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-royal-600 text-xs block leading-snug"
                        >
                          {pub.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span className="font-semibold text-royal-700 dark:text-royal-400">
                            {pub.journalOrConferenceName || pub.publisher || 'Unspecified Venue'}
                          </span>
                          {pub.academicYear && <span>• {pub.academicYear}</span>}
                          {pub.doi && (
                            <span className="font-mono text-slate-400 truncate max-w-xs">
                              DOI: {pub.doi}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300 capitalize">
                        {pub.publicationType?.replace('_', ' ')}
                      </td>

                      {/* Faculty */}
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                        {pub.faculty?.name || 'Faculty Member'}
                      </td>

                      {/* Indexing */}
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
                          <span className="text-slate-400 text-[11px]">Peer-Reviewed</span>
                        )}
                      </td>

                      {/* Citations */}
                      <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {pub.citationCount || 0}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={pub.verificationStatus} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canSubmit && (
                            <button
                              onClick={() => setSubmitId(pub._id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                              title="Submit for Verification"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canEdit && (
                            <Link
                              to={`/publications/${pub._id}/edit`}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg"
                              title="Edit Publication"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          {(isOwner || user?.role === 'admin') && (
                            <button
                              onClick={() => setDeleteId(pub._id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <Link
                            to={`/publications/${pub._id}`}
                            className="px-2.5 py-1 text-royal-600 dark:text-royal-400 hover:bg-royal-50 dark:hover:bg-royal-950/60 rounded-lg font-bold"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          totalItems={total}
          itemsPerPage={10}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Publication Record"
        message="Are you sure you want to delete this publication? This action cannot be undone and will permanently remove this record from the database."
        confirmText="Yes, Delete Record"
        isDestructive={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />

      {/* Submit Confirmation Modal */}
      <ConfirmModal
        isOpen={!!submitId}
        title="Submit Publication for Review"
        message="Are you ready to submit this publication for formal departmental scrutiny? Once submitted, reviewers and HODs will evaluate the documentary evidence."
        confirmText="Confirm Submission"
        isLoading={submitLoading}
        onConfirm={handleSubmitForReview}
        onClose={() => setSubmitId(null)}
      />
    </div>
  );
};

export default PublicationList;
