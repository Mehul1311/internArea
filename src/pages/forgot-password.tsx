import React, { useState } from 'react';
import { apiClient } from '@/api/axios';
import { KeyRound, Mail, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await apiClient.post('/auth/forgot-password', { identifier });
      setResult(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
              <KeyRound size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Forgot Password</h1>
            <p className="text-sm text-gray-600 mt-2">
              Enter your registered Email Address or Phone Number to generate a new secure password.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-2">
                Registered Email or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. student@example.com or 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-900 font-medium"
                  required
                />
                <div className="absolute left-3.5 top-3.5 text-gray-400">
                  <Mail size={18} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Reset Password'}
              <ArrowRight size={18} />
            </button>
          </form>

          {errorMsg && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800">
              <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold">Action Restricted</div>
                <div className="text-xs font-semibold mt-0.5">{errorMsg}</div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 size={20} /> Reset Link Sent!
              </div>
              <p className="text-xs text-emerald-700 mb-3">
                Please check your email. We have sent a password reset link to your registered email address.
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link href="/login" className="text-xs text-blue-600 hover:underline font-semibold">
              Back to Login Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
