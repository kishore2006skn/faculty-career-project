import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-royal-50 dark:bg-royal-950/60 text-royal-600 flex items-center justify-center mb-4 shadow-lg shadow-royal-600/10">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">
        404 - Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
        The requested portal module, publication document, or route could not be found.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-royal-600/20"
        >
          <Home className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
