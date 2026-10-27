import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Building2,
  Mail,
  GraduationCap,
  ExternalLink,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FacultyDirectory = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedDept]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDept) params.department = selectedDept;

      const [facRes, deptRes] = await Promise.all([
        api.get('/faculty', { params }),
        api.get('/admin/departments'),
      ]);

      if (facRes.data?.success) setFacultyList(facRes.data.data);
      if (deptRes.data?.success) setDepartments(deptRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = facultyList.filter((f) => {
    const term = search.toLowerCase();
    return (
      f.name?.toLowerCase().includes(term) ||
      f.email?.toLowerCase().includes(term) ||
      f.facultyId?.toLowerCase().includes(term) ||
      f.designation?.toLowerCase().includes(term) ||
      f.department?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Institutional Faculty Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse active professors, researchers, and academic mentors across departments.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or designation..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Building2 className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-royal-500 w-full sm:w-auto"
          >
            <option value="">All Academic Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Loading faculty members..." />
      ) : filteredFaculty.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No faculty members found.
          </p>
          <p className="text-xs text-slate-500 mt-1">Try refining your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFaculty.map((fac) => (
            <div
              key={fac._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-royal-600 text-white flex items-center justify-center text-lg font-black shrink-0 overflow-hidden ring-2 ring-royal-100 dark:ring-royal-950">
                    {fac.profilePhotoUrl ? (
                      <img
                        src={fac.profilePhotoUrl}
                        alt={fac.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      fac.name?.substring(0, 2).toUpperCase() || 'FA'
                    )}
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-royal-50 text-royal-700 dark:bg-royal-950/60 dark:text-royal-300">
                      {fac.facultyId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {fac.name}
                    </h3>
                    <p className="text-xs font-semibold text-royal-600 dark:text-royal-400">
                      {fac.designation}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{fac.department?.name || 'Department'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{fac.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  to={`/profile/${fac._id}`}
                  className="text-xs font-bold text-royal-600 dark:text-royal-400 hover:underline inline-flex items-center gap-1"
                >
                  View Profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/publications?faculty=${fac._id}`}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3" /> Publications
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyDirectory;
