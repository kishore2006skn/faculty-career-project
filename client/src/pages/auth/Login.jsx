import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    searchParams.get('sessionExpired')
      ? 'Your session has expired. Please sign in again.'
      : ''
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please provide both official email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email.trim(), formData.password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Invalid email or password. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick fill credentials for demo evaluator convenience
  const fillDemoAccount = (email, password) => {
    setFormData({ email, password, rememberMe: true });
    setError('');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Sign In to Portal
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Access your research profile, publication verification & appraisal summary
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Institutional Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="faculty@institution.edu"
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500 text-slate-900 dark:text-white transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Account Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-royal-600 dark:text-royal-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500 text-slate-900 dark:text-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              className="w-4 h-4 text-royal-600 rounded border-slate-300 focus:ring-royal-500"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Remember me
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-royal-600/20 transition-all disabled:opacity-50"
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      {/* Demo Credentials Helper */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-royal-700 dark:text-royal-300 mb-2.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Demo One-Click Sign In:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount('dr.sharma@institution.edu', 'Password@123')}
            className="px-2 py-1.5 text-[11px] font-semibold bg-royal-50 hover:bg-royal-100 dark:bg-royal-950/40 text-royal-700 dark:text-royal-300 rounded-lg border border-royal-200 dark:border-royal-800 transition-colors text-center"
          >
            Faculty
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('hod.cse@institution.edu', 'Password@123')}
            className="px-2 py-1.5 text-[11px] font-semibold bg-royal-50 hover:bg-royal-100 dark:bg-royal-950/40 text-royal-700 dark:text-royal-300 rounded-lg border border-royal-200 dark:border-royal-800 transition-colors text-center"
          >
            HOD / Reviewer
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('admin@institution.edu', 'Password@123')}
            className="px-2 py-1.5 text-[11px] font-semibold bg-royal-50 hover:bg-royal-100 dark:bg-royal-950/40 text-royal-700 dark:text-royal-300 rounded-lg border border-royal-200 dark:border-royal-800 transition-colors text-center"
          >
            Admin / Dean
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
        New faculty member?{' '}
        <Link to="/register" className="font-bold text-royal-600 dark:text-royal-400 hover:underline">
          Register account
        </Link>
      </p>
    </div>
  );
};

export default Login;
