import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Filter,
  Calendar,
  Building2,
  BookOpen,
  Quote,
  Layers,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const Analytics = () => {
  const { user } = useAuth();
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState('All');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [academicYear, department]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      if (res.data?.success) setDepartments(res.data.data);
    } catch (e) {}
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (academicYear && academicYear !== 'All') params.academicYear = academicYear;
      if (department) params.department = department;

      const res = await api.get('/dashboard/charts', { params });
      if (res.data?.success) {
        setCharts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !charts) {
    return <LoadingSpinner text="Computing research analytics & bibliometric trends..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-royal-600" />
            Institutional Research Analytics & Insights
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bibliometric output trends, departmental distribution, citation velocity, and peer-review status metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
          >
            <option value="All">All Academic Years</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2022-2023">2022-2023</option>
          </select>

          {user?.role !== 'faculty' && departments.length > 0 && (
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Row 1: Output by Year & Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Output by Year */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Publication Growth & Indexed Citations
            </h3>
            <p className="text-xs text-slate-500">Yearly research progression</p>
          </div>
          <div className="h-72 w-full">
            {charts?.byYear?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.byYear}>
                  <defs>
                    <linearGradient id="colorPub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorCit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b820" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#colorPub)"
                    name="Publications"
                  />
                  <Area
                    type="monotone"
                    dataKey="citations"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#colorCit)"
                    name="Citations"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No historical trend data available.
              </div>
            )}
          </div>
        </div>

        {/* Publication Type Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Scholarly Output Categorization
            </h3>
            <p className="text-xs text-slate-500">Distribution across publication categories</p>
          </div>
          <div className="h-72 w-full">
            {charts?.byType?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.byType}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {charts.byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No categorical breakdown available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Department Output Comparison (for admin/reviewers) */}
      {charts?.byDepartment?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Departmental Research Productivity Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Total publication volume and indexed citations by academic department
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.byDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b820" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#2563eb" name="Publications" radius={[4, 4, 0, 0]} />
                <Bar dataKey="citations" fill="#10b981" name="Citations" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
