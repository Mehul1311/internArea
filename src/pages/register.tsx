import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../api/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '../Feature/Userslice';

export default function Register() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      role_id: userData.role_id || (formData.role === 'employer' ? 2 : 1),
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
      const res = await apiClient.post('/auth/register', formData);

      toast.success('Registration successful! Please complete your profile.');
      if (res.data) {
        handleLoginSuccess(res.data.user, res.data.token);
      }
      router.push('/profile');
    } catch (err: any) {
      toast.error(`⚠️ ${err.response?.data?.error || err.message || 'Failed to register'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-gray-200 shadow-xl">
        <div>
          <h2 className="text-center text-2xl font-extrabold text-gray-900">Create your account</h2>
          <p className="text-center text-xs text-gray-500 mt-1">Join thousands of students and employers</p>
        </div>

        <form className="space-y-4 text-xs" onSubmit={handleSubmit}>
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">I am a</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="student">Student</option>
              <option value="employer">Employer</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
              placeholder="student@example.com"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Phone</label>
            <input
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
              placeholder="9876543210"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register Account'}
          </button>
        </form>

        <div className="text-center mt-4 text-xs font-medium text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
