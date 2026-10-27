import React, { useState, useEffect } from 'react';
import {
  Building2,
  PlusCircle,
  Edit3,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  X,
  FileText,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDepartments = () => {
  const { showToast } = useToast();

  const [departments, setDepartments] = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    head: '',
    isActive: true,
  });

  useEffect(() => {
    fetchDepartments();
    fetchFaculty();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/departments');
      if (res.data?.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load departments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/faculty');
      if (res.data?.success) {
        setFacultyMembers(res.data.data);
      }
    } catch (e) {}
  };

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      head: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      head: dept.head?._id || dept.head || '',
      isActive: dept.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDept) {
        await api.put(`/admin/departments/${editingDept._id}`, formData);
        showToast('Department updated successfully.', 'success');
      } else {
        await api.post('/admin/departments', formData);
        showToast('Department created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save department.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-royal-600" />
            Academic Departments Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure institutional faculties, assign Department Heads (HOD), and track departmental metrics.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-royal-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Add Department
        </button>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <LoadingSpinner text="Loading departments..." />
      ) : departments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          No departments configured.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-royal-100 text-royal-700 dark:bg-royal-950/60 dark:text-royal-300 font-mono">
                    {dept.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                    {dept.name}
                  </h3>
                </div>
                <button
                  onClick={() => handleOpenEdit(dept)}
                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {dept.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {dept.description}
                </p>
              )}

              {/* Head of Department */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">
                  Head of Department (HOD)
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {dept.head?.name || 'No HOD assigned'}
                </span>
                {dept.head?.email && (
                  <span className="text-[11px] text-royal-600 block">{dept.head.email}</span>
                )}
              </div>

              {/* Counts */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4 text-royal-600" />
                  <span>
                    <strong className="text-slate-900 dark:text-white">
                      {dept.facultyCount || 0}
                    </strong>{' '}
                    Faculty Members
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>
                    <strong className="text-slate-900 dark:text-white">
                      {dept.publicationCount || 0}
                    </strong>{' '}
                    Publications
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingDept ? 'Edit Academic Department' : 'Create New Academic Department'}
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
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. CSE"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Head of Department (HOD)
                </label>
                <select
                  value={formData.head}
                  onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">No HOD Assigned</option>
                  {facultyMembers.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.facultyId} - {f.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Specialization Focus
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of courses and laboratories..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
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
                  {submitting ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;
