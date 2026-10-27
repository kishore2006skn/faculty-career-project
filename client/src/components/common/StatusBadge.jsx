import React from 'react';

const statusConfig = {
  // Verification statuses
  approved: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Approved',
  },
  submitted: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    dot: 'bg-amber-500',
    label: 'Submitted for Review',
  },
  under_review: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
    dot: 'bg-blue-500',
    label: 'Under Review',
  },
  needs_correction: {
    bg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
    dot: 'bg-orange-500',
    label: 'Needs Correction',
  },
  rejected: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    dot: 'bg-rose-500',
    label: 'Rejected',
  },
  draft: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
    label: 'Draft',
  },
  // User statuses
  active: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Active',
  },
  pending: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    dot: 'bg-amber-500',
    label: 'Pending Approval',
  },
  deactivated: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    dot: 'bg-rose-500',
    label: 'Deactivated',
  },
  // Project statuses
  sanctioned: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
    dot: 'bg-purple-500',
    label: 'Sanctioned',
  },
  ongoing: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
    dot: 'bg-blue-500',
    label: 'Ongoing',
  },
  completed: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Completed',
  },
};

const StatusBadge = ({ status, className = '' }) => {
  const norm = (status || 'draft').toLowerCase().replace(/\s+/g, '_');
  const cfg = statusConfig[norm] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    label: status || 'Unknown',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
