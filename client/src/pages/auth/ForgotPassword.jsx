import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devToken, setDevToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDevToken(null);

    if (!email.trim()) {
      setError('Please provide your institutional email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setSuccess(res.data?.message || 'Password reset instructions have been generated.');
      if (res.data?.devResetToken) {
        setDevToken(res.data.devResetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-600 dark:text-royal-400 hover:underline mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Reset Your Password
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter your registered institutional email to receive a secure, single-use password reset link.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{success}</p>
            {devToken && (
              <div className="mt-2 p-2 bg-emerald-100/60 dark:bg-emerald-900/40 rounded-lg text-[11px] font-mono break-all">
                <span className="font-sans font-bold block text-slate-800 dark:text-slate-200 mb-0.5">
                  Development Mode Reset Token:
                </span>
                {devToken}
                <div className="mt-2">
                  <Link
                    to={`/reset-password?token=${devToken}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-royal-600 text-white font-sans text-xs hover:bg-royal-700"
                  >
                    <KeyRound className="w-3 h-3" /> Click here to Reset Now
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Registered Institutional Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dr.sharma@institution.edu"
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-royal-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            'Verifying...'
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Send Reset Token
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
