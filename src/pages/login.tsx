import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../api/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';
import { auth, provider, signInWithPopup, signInWithEmailAndPassword } from '../firebase/firebase';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '../Feature/Userslice';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSuccess = (userData: any) => {
    const userToStore = {
      id: userData.id || 1,
      uid: userData.id || userData.uid || 1,
      username: userData.username || userData.email,
      email: userData.username || userData.email,
      name: userData.name || userData.username?.split('@')[0] || 'User',
      phone: userData.phone || '',
      role_id: userData.role_id || 1,
      photo: userData.photo || userData.profile_picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"
    };
    localStorage.setItem('app_user', JSON.stringify(userToStore));
    dispatch(loginAction(userToStore));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Sign in with Firebase Auth
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 2. Wait for the token to be available (axios interceptor handles sending it)
      await result.user.getIdToken(true);

      // 3. Call backend to sync user
      const res = await apiClient.get('/auth/me');

      toast.success('🎉 Login successful!');
      if (res.data) {
        handleLoginSuccess(res.data);
      }
      router.push('/profile');
    } catch (err: any) {
      console.error(err);
      toast.error(`⚠️ ${err.message || 'Login failed'}`);
      await auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      
      // 1. Wait for token
      await result.user.getIdToken(true);

      // 2. Sync with backend
      const res = await apiClient.get('/auth/me');

      toast.success(`🎉 Welcome ${result.user.displayName || 'User'}! Signed in with Google.`);
      if (res.data) {
        handleLoginSuccess(res.data);
      }
      router.push('/profile');
    } catch (err: any) {
      console.error("Google Sign In Error:", err);
      toast.error(`Google Sign In failed: ${err.message || 'Unknown error'}`);
      await auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-gray-200 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
            <Lock size={30} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Account Sign In</h1>
          <p className="text-xs text-gray-500 mt-1">
            Access Internships, Jobs, Public Space & Resume Builder
          </p>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-6 py-3 px-4 border border-gray-300 rounded-xl bg-white text-gray-700 font-bold text-xs hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase">Or Email Sign In</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
              placeholder="student@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-xs">
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Create New Account
          </Link>
          <Link href="/forgot-password" className="text-gray-500 font-semibold hover:text-gray-800">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
