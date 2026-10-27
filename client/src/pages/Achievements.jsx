import React, { useState, useEffect } from 'react';
import {
  Award,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  Building2,
  Trash2,
  Edit3,
  ExternalLink,
  Download,
  Upload,
  CheckCircle,
  X,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ACHIEVEMENT_CATEGORIES = [
  { value: 'fdp', label: 'Faculty Development Program (FDP)' },
  { value: 'workshop', label: 'Workshop / Seminar Attended' },
  { value: 'conference_attended', label: 'National / International Conference' },
  { value: 'certification', label: 'Professional Certification / NPTEL' },
  { value: 'invited_talk', label: 'Invited Talk / Session Chair' },
  { value: 'award', label: 'Award & Academic Recognition' },
  { value: 'consultancy', label: 'Consultancy Assignment' },
  { value: 'teaching_innovation', label: 'Teaching Innovation / MOOC Developed' },
  { value: 'academic_responsibility', label: 'Institutional / Academic Committee' },
  { value: 'professional_membership', label: 'Professional Body Membership' },
  { value: 'student_supervision', label: 'Ph.D. / M.Tech Research Guidance' },
];

const Achievements = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'fdp',
    description: '',
    issuingOrganization: '',
    startDate: '',
    endDate: '',
    academicYear: '2024-2025',
    advancementPoints: 10,
  });

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, [categoryFilter, yearFilter]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (yearFilter) params.academicYear = yearFilter;

      const res = await api.get('/achievements', { params });
      if (res.data?.success) {
        setAchievements(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load achievements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({
      title: '',
      category: 'fdp',
      description: '',
      issuingOrganization: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      academicYear: '2024-2025',
      advancementPoints: 10,
    });
    setEvidenceFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description || '',
      issuingOrganization: item.issuingOrganization || '',
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      academicYear: item.academicYear || '2024-2025',
      advancementPoints: item.advancementPoints || 10,
    });
    setEvidenceFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((k) => payload.append(k, formData[k]));
      if (evidenceFile) {
        payload.append('evidenceFile', evidenceFile);
      }

      if (editItem) {
        await api.put(`/achievements/${editItem._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Achievement updated successfully.', 'success');
      } else {
        await api.post('/achievements', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Achievement recorded successfully!', 'success');
      }

      setIsModalOpen(false);
      fetchAchievements();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save achievement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/achievements/${deleteId}`);
      showToast('Achievement deleted successfully.', 'success');
      setDeleteId(null);
      fetchAchievements();
    } catch (err) {
      showToast('Failed to delete achievement.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-royal-600" />
            Faculty Achievements & Professional Development
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track FDPs, workshops, certificates, awards, and consultancy activities for career advancement credits.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-royal-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Record Achievement
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-royal-600" />
          <span className="font-bold text-slate-700 dark:text-slate-300">Filters:</span>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium"
        >
          <option value="">All Categories</option>
          {ACHIEVEMENT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium"
        >
          <option value="">All Academic Years</option>
          <option value="2025-2026">2025-2026</option>
          <option value="2024-2025">2024-2025</option>
          <option value="2023-2024">2023-2024</option>
          <option value="2022-2023">2022-2023</option>
        </select>

        {(categoryFilter || yearFilter) && (
          <button
            onClick={() => {
              setCategoryFilter('');
              setYearFilter('');
            }}
            className="text-royal-600 dark:text-royal-400 font-semibold hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Achievement Cards / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading achievements..." />
        ) : achievements.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No achievements recorded. Click "Record Achievement" to submit evidence.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Achievement Title & Host</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Faculty Member</th>
                  <th className="py-3.5 px-4">Academic Year</th>
                  <th className="py-3.5 px-4">CAS Credit</th>
                  <th className="py-3.5 px-4">Evidence</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {achievements.map((ach) => (
                  <tr
                    key={ach._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 max-w-sm">
                      <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                        {ach.title}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                        {ach.issuingOrganization || 'Institutional'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 capitalize font-semibold text-slate-700 dark:text-slate-300">
                      {ach.category?.replace('_', ' ')}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {ach.faculty?.name || 'Faculty Member'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {ach.academicYear}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-royal-600 dark:text-royal-400">
                      {ach.advancementPoints || 0} pts
                    </td>

                    <td className="py-3.5 px-4">
                      {ach.evidenceFileUrl ? (
                        <a
                          href={ach.evidenceFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="text-royal-600 hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <Download className="w-3 h-3" /> Proof
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={ach.verificationStatus} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(ach)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(ach._id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Achievement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editItem ? 'Edit Achievement Record' : 'Record New Professional Achievement'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title / Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. AICTE Sponsored FDP on Deep Learning Architectures"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Achievement Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {ACHIEVEMENT_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year *
                  </label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                    <option value="2022-2023">2022-2023</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issuing / Organizing Body
                </label>
                <input
                  type="text"
                  value={formData.issuingOrganization}
                  onChange={(e) =>
                    setFormData({ ...formData, issuingOrganization: e.target.value })
                  }
                  placeholder="e.g. IIT Bombay / AICTE / IEEE"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Claimed Advancement Credit (Points)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.advancementPoints}
                  onChange={(e) =>
                    setFormData({ ...formData, advancementPoints: parseInt(e.target.value) || 0 })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Evidence Certificate / Letter (PDF/DOC)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-royal-50 file:text-royal-700 hover:file:bg-royal-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-xl shadow-md"
                >
                  {submitting ? 'Saving...' : 'Save Achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Achievement Record"
        message="Are you sure you want to delete this achievement record and forfeit its promotional score credits?"
        confirmText="Yes, Delete"
        isDestructive={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};

export default Achievements;
