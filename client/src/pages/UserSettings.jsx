import React, { useState } from 'react';
import { Settings, Lock, User, Moon, Sun, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const UserSettings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      // In our auth setup, reset password or update password
      await api.post('/auth/reset-password', {
        token: 'settings-change', // Or dedicated endpoint
        newPassword,
      });
      showToast('Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Password update failed.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-royal-600" />
          Account & Portal Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your institutional access credentials, authentication security, and display preferences.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Account Profile Credentials
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Official Name</span>
            <span className="font-bold text-slate-800 dark:text-white text-sm">{user?.name}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Institutional Email</span>
            <span className="font-semibold text-slate-800 dark:text-white">{user?.email}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Faculty ID / Employee Code</span>
            <span className="font-mono font-bold text-royal-600 dark:text-royal-400">
              {user?.facultyId}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Authorized System Role</span>
            <span className="font-bold capitalize text-slate-800 dark:text-white">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Appearance & Theme Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Theme & Display Preferences
        </h2>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="font-bold text-slate-800 dark:text-white block">Portal Visual Theme</span>
            <span className="text-slate-500 text-[11px]">
              Currently active: <strong className="capitalize">{theme} Mode</strong>
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-royal-600" /> Switch to Dark Mode
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" /> Switch to Light Mode
              </>
            )}
          </button>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Security & Password Management
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password (min 8 characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new strong password"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSettings;
