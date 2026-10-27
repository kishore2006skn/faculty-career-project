import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  PlusCircle,
  Building2,
  Calendar,
  DollarSign,
  Download,
  Trash2,
  Edit3,
  X,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ResearchProjects = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [docFile, setDocFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    fundingAgency: 'DST / SERB',
    grantType: 'Sponsored Research',
    role: 'Principal Investigator (PI)',
    sanctionOrderNumber: '',
    amountSanctioned: 500000,
    startDate: '',
    endDate: '',
    academicYear: '2024-2025',
    status: 'ongoing',
    description: '',
  });

  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/research-projects');
      if (res.data?.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load research projects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({
      title: '',
      fundingAgency: 'DST / SERB',
      grantType: 'Sponsored Research',
      role: 'Principal Investigator (PI)',
      sanctionOrderNumber: '',
      amountSanctioned: 500000,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      academicYear: '2024-2025',
      status: 'ongoing',
      description: '',
    });
    setDocFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setFormData({
      title: item.title,
      fundingAgency: item.fundingAgency,
      grantType: item.grantType || 'Sponsored Research',
      role: item.role || 'Principal Investigator (PI)',
      sanctionOrderNumber: item.sanctionOrderNumber || '',
      amountSanctioned: item.amountSanctioned || 0,
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      academicYear: item.academicYear || '2024-2025',
      status: item.status || 'ongoing',
      description: item.description || '',
    });
    setDocFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((k) => payload.append(k, formData[k]));
      if (docFile) payload.append('supportingDoc', docFile);

      if (editItem) {
        await api.put(`/research-projects/${editItem._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Project updated successfully.', 'success');
      } else {
        await api.post('/research-projects', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Research grant recorded successfully!', 'success');
      }

      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      showToast('Failed to save project record.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/research-projects/${deleteId}`);
      showToast('Project deleted successfully.', 'success');
      setDeleteId(null);
      fetchProjects();
    } catch (err) {
      showToast('Failed to delete project.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalSanctioned = projects.reduce((acc, p) => acc + (p.amountSanctioned || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-royal-600" />
            Sponsored Research & Consultancy Grants
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Institutional project portfolio, industry consultancies, and extramural grant funding.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-royal-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Record New Grant
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Sanctioned Grants</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ₹{totalSanctioned.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Extramural & Institutional Research Funding</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Funded Projects Count</span>
          <p className="text-2xl font-black text-royal-600 dark:text-royal-400 mt-2">
            {projects.length}
          </p>
          <span className="text-[11px] text-slate-400">Total active & completed assignments</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Principal Investigator (PI) Roles</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {projects.filter((p) => p.role?.includes('Principal')).length}
          </p>
          <span className="text-[11px] text-slate-400">Lead institutional research projects</span>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading funded projects..." />
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No research grants recorded. Click "Record New Grant" to register sponsored projects.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Project Title & Agency</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Sanction Order</th>
                  <th className="py-3.5 px-4">Amount Sanctioned</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map((proj) => (
                  <tr
                    key={proj._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 max-w-sm">
                      <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                        {proj.title}
                      </span>
                      <span className="text-[11px] text-royal-600 dark:text-royal-400 font-semibold block mt-0.5">
                        {proj.fundingAgency}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {proj.role}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {proj.sanctionOrderNumber || '-'}
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      ₹{proj.amountSanctioned?.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {proj.academicYear}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={proj.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(proj)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(proj._id)}
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

      {/* Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editItem ? 'Edit Funded Project' : 'Record Sponsored Research / Consultancy Grant'}
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
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Design of Resilient Edge AI Architectures"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Funding Agency *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fundingAgency}
                    onChange={(e) => setFormData({ ...formData, fundingAgency: e.target.value })}
                    placeholder="e.g. DST / SERB / DRDO / Industry"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role in Project *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="Principal Investigator (PI)">Principal Investigator (PI)</option>
                    <option value="Co-Principal Investigator (Co-PI)">Co-Principal Investigator (Co-PI)</option>
                    <option value="Consultant">Lead Consultant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sanction Order Number
                  </label>
                  <input
                    type="text"
                    value={formData.sanctionOrderNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, sanctionOrderNumber: e.target.value })
                    }
                    placeholder="e.g. DST/SERB/2024/001"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount Sanctioned (INR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.amountSanctioned}
                    onChange={(e) =>
                      setFormData({ ...formData, amountSanctioned: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="sanctioned">Sanctioned</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sanction Order Letter / Grant Proof (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
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
                  {submitting ? 'Saving...' : 'Save Grant Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Project Record"
        message="Are you sure you want to remove this research project record from institutional metrics?"
        confirmText="Yes, Delete"
        isDestructive={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ResearchProjects;
