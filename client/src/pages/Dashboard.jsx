import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  Quote,
  TrendingUp,
  PlusCircle,
  FileText,
  Filter,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Building2,
  FileCheck2,
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
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState('All');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [academicYear, department]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      if (res.data?.success) {
        setDepartments(res.data.data);
      }
    } catch (e) {}
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (academicYear && academicYear !== 'All') params.academicYear = academicYear;
      if (department) params.department = department;

      const [statsRes, chartsRes] = await Promise.all([
        api.get('/dashboard/summary', { params }),
        api.get('/dashboard/charts', { params }),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (chartsRes.data?.success) setCharts(chartsRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading && !stats) {
    return <LoadingSpinner text="Loading your academic dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-royal-900 via-royal-800 to-primary-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-royal-200 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Academic Session {academicYear === 'All' ? '2023-2025' : academicYear}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {user?.name || 'Faculty Member'}!
            </h1>
            <p className="text-royal-100 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
              Welcome to the Institutional Career Advancement & Publication Summary Portal.
              {user?.role === 'admin'
                ? ' Full administrative oversight and institutional metrics active.'
                : user?.role === 'reviewer'
                ? ' Departmental scrutiny and verification queue active.'
                : ' Track verified research impact, API scores, and CAS promotion milestones.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/publications/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-royal-900 hover:bg-royal-50 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-royal-600" />
              Add Publication
            </Link>
            <Link
              to="/generate-summary"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" />
              Generate Summary
            </Link>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-royal-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-royal-600" />
          <span>Dashboard Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-royal-500"
            >
              <option value="All">All Academic Years</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
            </select>
          </div>

          {user?.role !== 'faculty' && departments.length > 0 && (
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-royal-500"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Publications */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Publications</span>
            <div className="w-8 h-8 rounded-xl bg-royal-50 dark:bg-royal-950/60 text-royal-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {stats?.totalPublications || 0}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-royal-600">{stats?.journalCount || 0}</span> Journals •{' '}
            <span className="font-semibold text-emerald-600">{stats?.conferenceCount || 0}</span> Conf
          </div>
        </div>

        {/* Citations Count */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Recorded Citations</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Quote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {stats?.totalCitations || 0}
          </p>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Across verified Scopus & WoS records
          </div>
        </div>

        {/* Achievements & FDPs */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Achievements & FDPs</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {stats?.totalAchievements || 0}
          </p>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Workshops, Awards & Consultancies
          </div>
        </div>

        {/* Pending Approvals or Faculty count */}
        {user?.role === 'faculty' ? (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">CAS Score Status</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {stats?.advancementSummary?.pointsEarned || 0}{' '}
              <span className="text-xs font-normal text-slate-400">
                / {stats?.advancementSummary?.pointsRequired || 50} pts
              </span>
            </p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                  stats?.advancementSummary?.isEligibleProvisional
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {stats?.advancementSummary?.isEligibleProvisional
                  ? 'Criteria Met (Provisional)'
                  : 'Requirements in Progress'}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Review Queue</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
              {stats?.pendingApprovals || 0}
            </p>
            <div className="mt-2">
              <Link
                to="/reviews"
                className="text-[11px] font-semibold text-royal-600 dark:text-royal-400 hover:underline inline-flex items-center gap-1"
              >
                Review submissions <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publications by Academic Year */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Research Output by Year</h3>
              <p className="text-xs text-slate-500">Publications & citations indexed</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {charts?.byYear?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.byYear}>
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
                  <Bar dataKey="count" fill="#2563eb" name="Publications" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="citations" fill="#f59e0b" name="Citations" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No publication records available for this filter.
              </div>
            )}
          </div>
        </div>

        {/* Publications by Category */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Publication Distribution by Type</h3>
              <p className="text-xs text-slate-500">Breakdown of journals, conferences, patents, books</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {charts?.byType?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.byType}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
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

      {/* Recent Publications Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Publications & Scrutiny</h3>
            <p className="text-xs text-slate-500">Latest submissions and verification status</p>
          </div>
          <Link
            to="/publications"
            className="text-xs font-semibold text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1"
          >
            View all publications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Title & Publication Details</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Faculty Owner</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Indexing</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {stats?.recentPublications?.length > 0 ? (
                stats.recentPublications.map((pub) => (
                  <tr key={pub._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <Link
                        to={`/publications/${pub._id}`}
                        className="font-bold text-slate-800 dark:text-slate-100 hover:text-royal-600 block line-clamp-1"
                      >
                        {pub.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
                        {pub.journalOrConferenceName || pub.publisher || 'Unspecified Venue'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 capitalize font-medium text-slate-600 dark:text-slate-300">
                      {pub.publicationType?.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {pub.faculty?.name || 'Faculty Member'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {pub.academicYear || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {pub.indexingStatus?.isScopus ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Scopus {pub.indexingStatus.quartile || ''}
                        </span>
                      ) : pub.indexingStatus?.isWoS ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-royal-50 text-royal-700 border border-royal-200">
                          WoS
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Peer Reviewed</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={pub.verificationStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/publications/${pub._id}`}
                        className="px-2.5 py-1 text-[11px] font-semibold text-royal-600 dark:text-royal-400 hover:bg-royal-50 dark:hover:bg-royal-950/60 rounded-lg transition-colors"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-xs text-slate-400">
                    No publications recorded yet. Click "Add Publication" to submit your first research paper.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
