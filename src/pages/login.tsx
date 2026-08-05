import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../api/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';
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

  const handleLoginSuccess = (userData: any, token: string) => {
    const userToStore = {
      id: userData.id || 1,
      uid: userData.id || userData.uid || 1,
      username: userData.username || userData.email,
      email: userData.username || userData.email,
      name: userData.name || userData.username?.split('@')[0] || 'User',
      phone: userData.phone || '',
      role_id: userData.role_id || (userData.role === 'employer' ? 2 : 1),
      photo: userData.photo || userData.profile_picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"
    };
    localStorage.setItem('app_user', JSON.stringify(userToStore));
    localStorage.setItem('jwt_token', token); // Store JWT token
    dispatch(loginAction(userToStore));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await apiClient.post('/auth/login', formData);

      toast.success('🎉 Login successful!');
      if (res.data) {
        handleLoginSuccess(res.data.user, res.data.token);
      }
      router.push('/profile');
    } catch (err: any) {
      console.error(err);
      toast.error(`⚠️ ${err.response?.data?.error || err.message || 'Login failed'}`);
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
