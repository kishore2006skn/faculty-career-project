import React, { useState, useEffect } from 'react';
import { History, Shield, Filter, Search, Calendar, User } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AuditLogs = () => {
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entityType = entityFilter;

      const res = await api.get('/admin/audit-logs', { params });
      if (res.data?.success) {
        setLogs(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      showToast('Failed to load system audit logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-royal-600" />
          System Security & Activity Audit Logs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Immutable event log tracking administrative modifications, review decisions, and report generation events.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-royal-600" />
          <span className="font-bold text-slate-700 dark:text-slate-300">Filter Events:</span>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium"
        >
          <option value="">All Action Types</option>
          <option value="USER_LOGIN">User Logins</option>
          <option value="PUBLICATION_CREATED">Publication Created</option>
          <option value="PUBLICATION_SUBMITTED">Publication Submitted</option>
          <option value="PUBLICATION_REVIEWED">Publication Reviewed</option>
          <option value="REPORT_GENERATED_PDF">Report Generated (PDF)</option>
          <option value="REPORT_GENERATED_EXCEL">Report Generated (Excel)</option>
          <option value="ADMIN_USER_UPDATED">Admin User Modified</option>
          <option value="DEPARTMENT_CREATED">Department Created</option>
        </select>

        <select
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value);
            setPage(1);
          }}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium"
        >
          <option value="">All Entity Types</option>
          <option value="User">User</option>
          <option value="Publication">Publication</option>
          <option value="Achievement">Achievement</option>
          <option value="GeneratedReport">GeneratedReport</option>
          <option value="Department">Department</option>
          <option value="AdvancementPolicy">AdvancementPolicy</option>
        </select>

        {(actionFilter || entityFilter) && (
          <button
            onClick={() => {
              setActionFilter('');
              setEntityFilter('');
              setPage(1);
            }}
            className="text-royal-600 dark:text-royal-400 font-semibold hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving audit log stream..." />
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No audit logs recorded for this criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Details / Metadata</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-royal-600 dark:text-royal-400 block">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 dark:text-white block">
                        {log.actor?.name || 'System'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{log.actor?.email}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.entityType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 font-mono text-[11px]">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          totalItems={total}
          itemsPerPage={15}
        />
      </div>
    </div>
  );
};

export default AuditLogs;
