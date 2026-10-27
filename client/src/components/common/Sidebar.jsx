import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Users,
  BookOpen,
  Award,
  Briefcase,
  TrendingUp,
  FileText,
  FileCheck2,
  BarChart3,
  ShieldCheck,
  Building2,
  Sliders,
  History,
  X,
  GraduationCap,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isReviewer = user?.role === 'reviewer' || isAdmin;

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-royal-600 text-white shadow-sm shadow-royal-600/30'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-royal-700 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight block">
                FACULTY<span className="text-royal-600">ADVANCE</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase block">
                Publication Portal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Main Workspace */}
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 mb-2 block">
              Core Workspace
            </span>
            <nav className="space-y-1">
              <NavLink to="/" end className={navItemClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/profile" className={navItemClass}>
                <User className="w-4 h-4" />
                <span>My Faculty Profile</span>
              </NavLink>
              <NavLink to="/publications" className={navItemClass}>
                <BookOpen className="w-4 h-4" />
                <span>Publications</span>
              </NavLink>
              <NavLink to="/achievements" className={navItemClass}>
                <Award className="w-4 h-4" />
                <span>Achievements & FDPs</span>
              </NavLink>
              <NavLink to="/research-projects" className={navItemClass}>
                <Briefcase className="w-4 h-4" />
                <span>Projects & Grants</span>
              </NavLink>
              <NavLink to="/faculty" className={navItemClass}>
                <Users className="w-4 h-4" />
                <span>Faculty Directory</span>
              </NavLink>
              <NavLink to="/facilities" className={navItemClass}>
                <Cpu className="w-4 h-4" />
                <span>Research Facilities</span>
              </NavLink>
            </nav>
          </div>

          {/* Promotion & Reports */}
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 mb-2 block">
              Career Advancement & Reports
            </span>
            <nav className="space-y-1">
              <NavLink to="/advancement-tracker" className={navItemClass}>
                <TrendingUp className="w-4 h-4" />
                <span>CAS Eligibility Tracker</span>
              </NavLink>

              <NavLink
                to="/generate-summary"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-royal-600 text-white shadow-sm'
                      : 'bg-royal-50/70 dark:bg-royal-950/40 text-royal-700 dark:text-royal-300 hover:bg-royal-100 border border-royal-200/60 dark:border-royal-800/60'
                  }`
                }
              >
                <FileText className="w-4 h-4" />
                <span>Generate Summary</span>
              </NavLink>

              <NavLink to="/reports/history" className={navItemClass}>
                <History className="w-4 h-4" />
                <span>Report History</span>
              </NavLink>
              <NavLink to="/analytics" className={navItemClass}>
                <BarChart3 className="w-4 h-4" />
                <span>Research Analytics</span>
              </NavLink>
            </nav>
          </div>

          {/* Reviewer / HOD Queue */}
          {isReviewer && (
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 mb-2 block">
                Verification & Quality
              </span>
              <nav className="space-y-1">
                <NavLink to="/reviews" className={navItemClass}>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Review Queue</span>
                </NavLink>
              </nav>
            </div>
          )}

          {/* Institutional Administration */}
          {isAdmin && (
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 mb-2 block">
                Administration
              </span>
              <nav className="space-y-1">
                <NavLink to="/admin/users" className={navItemClass}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>User Accounts</span>
                </NavLink>
                <NavLink to="/admin/departments" className={navItemClass}>
                  <Building2 className="w-4 h-4" />
                  <span>Departments</span>
                </NavLink>
                <NavLink to="/admin/policy" className={navItemClass}>
                  <Sliders className="w-4 h-4" />
                  <span>CAS Policy Rules</span>
                </NavLink>
                <NavLink to="/admin/audit-logs" className={navItemClass}>
                  <History className="w-4 h-4" />
                  <span>Audit Logs</span>
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        {/* Footer info badge */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Role</span>
            <span className="font-semibold text-royal-600 dark:text-royal-400 capitalize px-2 py-0.5 rounded-md bg-royal-50 dark:bg-royal-950/60 border border-royal-200 dark:border-royal-800">
              {user?.role || 'Guest'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
