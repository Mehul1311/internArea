import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../api/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { auth, provider, signInWithPopup, createUserWithEmailAndPassword } from '../firebase/firebase';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '../Feature/Userslice';

export default function Register() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Create user in Firebase
      await createUserWithEmailAndPassword(auth, formData.username, formData.password);
      
      // 2. Call backend to sync user (passing role and phone if they don't exist yet)
      // Since they just created the account, the backend will auto-create the user record
      // We can pass the role and phone as query params or custom endpoint, but /auth/me auto-creates them.
      // A better way is to update the newly created user in our db right after if needed, 
      // but for now, logging them in takes them to /profile where they can update details.
      await auth.currentUser?.getIdToken(true);
      await apiClient.get(`/auth/me?login_attempt=true&role=${formData.role}&phone=${encodeURIComponent(formData.phone)}`);

      toast.success('Registration successful! Please complete your profile.');
      router.push('/profile');
    } catch (err: any) {
      toast.error(`⚠️ ${err.message || 'Failed to register'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userData = {
        id: user.uid,
        uid: user.uid,
        username: user.email,
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
        role: formData.role
      };

      localStorage.setItem('app_user', JSON.stringify(userData));
      dispatch(loginAction(userData));
      toast.success(`🎉 Account created with Google! Welcome ${user.displayName || 'User'}`);
      router.push('/profile');
    } catch (error: any) {
      console.error("Google Sign Up Error:", error);
      toast.error(`Google Sign Up failed: ${error.message}`);
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

        {/* Google Sign Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full py-3 px-4 border border-gray-300 rounded-xl bg-white text-gray-700 font-bold text-xs hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign up with Google</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase">Or Email Register</span>
          <div className="flex-grow border-t border-gray-200"></div>
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
              name="username"
              type="email"
              required
              value={formData.username}
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
