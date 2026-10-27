import React from 'react';
import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-950 to-royal-900 flex flex-col justify-center items-center p-4 selection:bg-royal-500 selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-royal-600 text-white shadow-xl shadow-royal-600/30 mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Apex Institute of Technology
          </h1>
          <p className="text-sm text-slate-300 font-medium mt-1">
            Faculty Career Advancement & Publication Summary Generator
          </p>
        </div>

        {/* Card for form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200/50 dark:border-slate-800">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Institutional Research & Faculty Appraisal System</p>
          <p className="mt-1 text-slate-500">Secured with Role-Based Access Control & Encrypted Sessions</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
