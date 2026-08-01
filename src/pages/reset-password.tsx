import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '@/api/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { CheckCircle2, KeyRound, Lock, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid token.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/auth/reset-password', {
        token,
        newPassword: password
      });
      if (res.data.success) {
        setSuccess(true);
        toast.success(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error resetting password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl">
          {!success && (
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                <KeyRound size={32} />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900">Create New Password</h1>
              <p className="text-sm text-gray-500 mt-2">
                Your new password must be at least 6 characters long and different from previous passwords.
              </p>
            </div>
          )}

          {success ? (
            <div className="text-center py-6 animate-fadeIn">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Password Reset Successfully!</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
                Your password has been successfully updated. You can now use your new password to log in.
              </p>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-md shadow-blue-500/20"
              >
                Back to Login
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <div className="absolute left-3.5 top-3.5 text-gray-400">
                    <Lock size={18} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <div className="absolute left-3.5 top-3.5 text-gray-400">
                    <Lock size={18} />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !token}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Updating Password...' : 'Reset Password'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
