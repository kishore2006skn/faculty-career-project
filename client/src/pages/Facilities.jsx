import React, { useState, useEffect } from 'react';
import {
  Building2,
  Cpu,
  PlusCircle,
  Search,
  Filter,
  Users,
  Server,
  Wrench,
  CheckCircle2,
  Clock,
  Layers,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  FileText,
  DollarSign,
  ShieldCheck,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Facilities = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [facilities, setFacilities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal State
  const [activeFacility, setActiveFacility] = useState(null);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    facilityCode: '',
    department: '',
    location: '',
    facultyInCharge: '',
    labTechnician: '',
    workstationCapacity: 30,
    status: 'Operational',
    description: '',
    researchDomains: '',
    softwareTools: '',
    industryPartners: '',
    equipmentList: [],
  });

  const [equipmentInput, setEquipmentInput] = useState({
    name: '',
    model: '',
    manufacturer: '',
    quantity: 1,
    status: 'Operational',
    approxValueInr: 0,
  });

  const canManage = user?.role === 'admin' || user?.role === 'reviewer';

  useEffect(() => {
    fetchFacilities();
    fetchDepartments();
    fetchFaculty();
  }, [selectedDept, statusFilter]);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDept) params.department = selectedDept;
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/facilities', { params });
      if (res.data?.success) {
        setFacilities(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load research facilities.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      if (res.data?.success) setDepartments(res.data.data);
    } catch (e) {}
  };

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/faculty');
      if (res.data?.success) setFacultyMembers(res.data.data);
    } catch (e) {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFacilities();
  };

  const openAddModal = () => {
    setEditingFacility(null);
    setFormData({
      name: '',
      facilityCode: '',
      department: departments[0]?._id || '',
      location: 'Academic Block A, Level 2',
      facultyInCharge: user?._id || '',
      labTechnician: '',
      workstationCapacity: 30,
      status: 'Operational',
      description: '',
      researchDomains: '',
      softwareTools: '',
      industryPartners: '',
      equipmentList: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (fac) => {
    setEditingFacility(fac);
    setFormData({
      name: fac.name,
      facilityCode: fac.facilityCode,
      department: fac.department?._id || fac.department || '',
      location: fac.location || '',
      facultyInCharge: fac.facultyInCharge?._id || fac.facultyInCharge || '',
      labTechnician: fac.labTechnician || '',
      workstationCapacity: fac.workstationCapacity || 30,
      status: fac.status || 'Operational',
      description: fac.description || '',
      researchDomains: Array.isArray(fac.researchDomains) ? fac.researchDomains.join(', ') : '',
      softwareTools: Array.isArray(fac.softwareTools) ? fac.softwareTools.join(', ') : '',
      industryPartners: Array.isArray(fac.industryPartners) ? fac.industryPartners.join(', ') : '',
      equipmentList: fac.equipmentList || [],
    });
    setIsModalOpen(true);
  };

  const addEquipmentItem = () => {
    if (!equipmentInput.name.trim()) return;
    setFormData((prev) => ({
      ...prev,
      equipmentList: [...prev.equipmentList, { ...equipmentInput }],
    }));
    setEquipmentInput({
      name: '',
      model: '',
      manufacturer: '',
      quantity: 1,
      status: 'Operational',
      approxValueInr: 0,
    });
  };

  const removeEquipmentItem = (idx) => {
    setFormData((prev) => ({
      ...prev,
      equipmentList: prev.equipmentList.filter((_, i) => i !== idx),
    }));
  };

  const handleSaveFacility = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        researchDomains: formData.researchDomains
          ? formData.researchDomains.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        softwareTools: formData.softwareTools
          ? formData.softwareTools.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        industryPartners: formData.industryPartners
          ? formData.industryPartners.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      if (editingFacility) {
        await api.put(`/facilities/${editingFacility._id}`, payload);
        showToast('Research facility updated successfully.', 'success');
      } else {
        await api.post('/facilities', payload);
        showToast('New research facility registered successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchFacilities();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save facility.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/facilities/${deleteId}`);
      showToast('Facility record deleted successfully.', 'success');
      setDeleteId(null);
      fetchFacilities();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete facility.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Calculations for KPI Cards
  const totalWorkstations = facilities.reduce((sum, f) => sum + (f.workstationCapacity || 0), 0);
  const totalEquipmentCount = facilities.reduce((sum, f) => sum + (f.equipmentList?.length || 0), 0);
  const totalEquipmentValue = facilities.reduce(
    (sum, f) => sum + (f.equipmentList?.reduce((acc, eq) => acc + (eq.approxValueInr || 0), 0) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-royal-600" />
            Institutional Research Facilities & Laboratories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            State-of-the-art supercomputing centers, VLSI cleanrooms, robotics workcells, and specialized experimental testbeds.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-royal-600/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Register New Facility
          </button>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Research Facilities</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {facilities.length}
          </p>
          <span className="text-[11px] text-royal-600 font-semibold">Active Centers</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Workstations</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalWorkstations}
          </p>
          <span className="text-[11px] text-slate-400">Computing & Lab Seats</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Major Equipment Units</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {totalEquipmentCount}
          </p>
          <span className="text-[11px] text-slate-400">Analyzers, GPUs & Instruments</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Infrastructure Value</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(totalEquipmentValue / 10000000).toFixed(1)} Cr+
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">Capital Grant Investment</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search facilities by name, lab code, domain, or equipment..."
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
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium"
          >
            <option value="">All Operational Statuses</option>
            <option value="Operational">Operational</option>
            <option value="Under Upgrade">Under Upgrade</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          {(selectedDept || statusFilter || search) && (
            <button
              onClick={() => {
                setSelectedDept('');
                setStatusFilter('');
                setSearch('');
              }}
              className="text-royal-600 dark:text-royal-400 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <LoadingSpinner text="Loading research facilities..." />
      ) : facilities.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          <Server className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No research facilities found. Click "Register New Facility" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {facilities.map((fac) => (
            <div
              key={fac._id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Badge Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-royal-100 text-royal-700 dark:bg-royal-950/60 dark:text-royal-300">
                      {fac.facilityCode}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {fac.department?.code || 'DEPT'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        fac.status === 'Operational'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {fac.status}
                    </span>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(fac)}
                        className="p-1.5 text-slate-400 hover:text-royal-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Facility"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => setDeleteId(fac._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Delete Facility"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Facility Name & Location */}
                <div>
                  <h3
                    onClick={() => setActiveFacility(fac)}
                    className="text-base sm:text-lg font-black text-slate-900 dark:text-white cursor-pointer hover:text-royal-600 transition-colors"
                  >
                    {fac.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {fac.location} • Workstations: <strong>{fac.workstationCapacity}</strong>
                  </p>
                </div>

                {/* Description */}
                {fac.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {fac.description}
                  </p>
                )}

                {/* Research Domains Chips */}
                {fac.researchDomains?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {fac.researchDomains.map((domain, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-royal-50 dark:bg-royal-950/40 text-royal-700 dark:text-royal-300 text-[10px] font-semibold rounded-md border border-royal-200/50 dark:border-royal-800/50"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                )}

                {/* Key Equipment Snapshot */}
                {fac.equipmentList?.length > 0 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Installed Hardware & Equipment ({fac.equipmentList.length})
                    </span>
                    <div className="space-y-1">
                      {fac.equipmentList.slice(0, 2).map((eq, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span className="font-semibold truncate max-w-[240px]">
                            • {eq.name} ({eq.model || eq.manufacturer})
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Qty: {eq.quantity}
                          </span>
                        </div>
                      ))}
                      {fac.equipmentList.length > 2 && (
                        <span className="text-[10px] text-royal-600 font-semibold block pt-0.5">
                          +{fac.equipmentList.length - 2} more instruments configured
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Coordinator Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Faculty In-Charge:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {fac.facultyInCharge?.name || 'Faculty Coordinator'}
                  </span>
                </div>

                <button
                  onClick={() => setActiveFacility(fac)}
                  className="px-3 py-1.5 bg-royal-50 dark:bg-royal-950/60 text-royal-700 dark:text-royal-300 hover:bg-royal-100 rounded-xl font-bold transition-colors"
                >
                  View Full Specs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Facility Full Details Modal */}
      {activeFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-royal-100 text-royal-700">
                  {activeFacility.facilityCode}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {activeFacility.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeFacility.department?.name} • {activeFacility.location}
                </p>
              </div>
              <button
                onClick={() => setActiveFacility(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Overview & Purpose
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeFacility.description || 'Dedicated institutional research laboratory.'}
              </p>
            </div>

            {/* Equipment Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Equipment Roster & Capital Tools ({activeFacility.equipmentList?.length || 0})
              </h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500">
                      <th className="py-2.5 px-3">Equipment Name</th>
                      <th className="py-2.5 px-3">Model & Make</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeFacility.equipmentList?.map((eq, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          {eq.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {eq.model} ({eq.manufacturer})
                        </td>
                        <td className="py-2.5 px-3 font-mono">{eq.quantity}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            {eq.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Software Licenses */}
            {activeFacility.softwareTools?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Licensed Software & Simulation Stacks
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeFacility.softwareTools.map((sw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold"
                    >
                      {sw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Industry Partners */}
            {activeFacility.industryPartners?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Industry Collaboration & Research Sponsors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeFacility.industryPartners.map((partner, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-royal-50 dark:bg-royal-950/60 text-royal-700 dark:text-royal-300 border border-royal-200 rounded-lg text-xs font-bold"
                    >
                      {partner}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Staffing Contact */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Faculty In-Charge / Coordinator
                </span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {activeFacility.facultyInCharge?.name}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {activeFacility.facultyInCharge?.email}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Laboratory Specialist / Technician
                </span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {activeFacility.labTechnician || 'Staff Coordinator'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Facility Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingFacility ? 'Edit Research Facility' : 'Register New Research Facility / Lab'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Facility / Lab Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. NVIDIA Center of Excellence in Deep Learning"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Facility Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.facilityCode}
                    onChange={(e) =>
                      setFormData({ ...formData, facilityCode: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. FAC-HPC-01"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location / Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Turing Block, 4th Floor, Room 402"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty Coordinator / In-Charge *
                  </label>
                  <select
                    value={formData.facultyInCharge}
                    onChange={(e) => setFormData({ ...formData, facultyInCharge: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    {facultyMembers.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.facultyId} - {f.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Workstation Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.workstationCapacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workstationCapacity: parseInt(e.target.value) || 30,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Operational Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Under Upgrade">Under Upgrade</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Research Capabilities
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of research activities supported..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Research Domains (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.researchDomains}
                  onChange={(e) => setFormData({ ...formData, researchDomains: e.target.value })}
                  placeholder="e.g. Deep Learning, Supercomputing, Edge AI"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Licensed Software Suites (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.softwareTools}
                  onChange={(e) => setFormData({ ...formData, softwareTools: e.target.value })}
                  placeholder="e.g. PyTorch Cluster, MATLAB, Cadence, Ansys"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* Equipment Item Adder */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Add Major Equipment / Instruments
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={equipmentInput.name}
                    onChange={(e) => setEquipmentInput({ ...equipmentInput, name: e.target.value })}
                    placeholder="Tool Name"
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <input
                    type="text"
                    value={equipmentInput.model}
                    onChange={(e) => setEquipmentInput({ ...equipmentInput, model: e.target.value })}
                    placeholder="Model / Make"
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <input
                    type="number"
                    min="1"
                    value={equipmentInput.quantity}
                    onChange={(e) =>
                      setEquipmentInput({
                        ...equipmentInput,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="Qty"
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addEquipmentItem}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-lg font-bold"
                  >
                    + Add Tool
                  </button>
                </div>

                {formData.equipmentList.length > 0 && (
                  <div className="space-y-1">
                    {formData.equipmentList.map((eq, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border border-slate-100"
                      >
                        <span>
                          {eq.name} ({eq.model || 'Standard'}) - Qty: {eq.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEquipmentItem(idx)}
                          className="text-rose-500 hover:text-rose-700 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  {submitting ? 'Saving...' : 'Save Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Facility Record"
        message="Are you sure you want to remove this research facility from institutional records?"
        confirmText="Yes, Delete"
        isDestructive={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};

export default Facilities;
