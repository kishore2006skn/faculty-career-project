import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, Check, Trash2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('All notifications marked as read.', 'success');
    } catch (err) {
      showToast('Failed to mark all as read.', 'error');
    }
  };

  const markSingleRead = async (id, link) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      if (link) {
        window.location.href = link;
      }
    } catch (e) {}
  };

  const filtered =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-royal-600" />
            Institutional Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with peer-review scrutiny results, verification requests, and system alerts.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-royal-50 dark:bg-royal-950/60 text-royal-700 dark:text-royal-300 rounded-xl text-xs font-bold hover:bg-royal-100 transition-colors self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setFilter('all')}
          className={`py-3 border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-royal-600 text-royal-600 dark:text-royal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`py-3 border-b-2 transition-colors ${
            filter === 'unread'
              ? 'border-royal-600 text-royal-600 dark:text-royal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading notifications..." />
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No notifications to display.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((notif) => (
              <div
                key={notif._id}
                onClick={() => markSingleRead(notif._id, notif.link)}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                  !notif.isRead ? 'bg-royal-50/40 dark:bg-royal-950/20' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-royal-600 shrink-0"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[11px] text-slate-400 block pt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>

                {notif.link && (
                  <span className="text-xs font-semibold text-royal-600 dark:text-royal-400 shrink-0 inline-flex items-center gap-1 hover:underline">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
