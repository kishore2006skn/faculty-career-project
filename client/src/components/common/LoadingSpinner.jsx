import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading data...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Loader2 className="w-10 h-10 animate-spin text-royal-600 mb-3" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-royal-600 mb-2" />
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
};

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 animate-pulse shadow-sm"
        >
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
