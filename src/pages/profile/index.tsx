import React, { useState, useEffect, useRef } from "react";
import LoginHistory from "@/Components/LoginHistory";
import Link from "next/link";
import { Mail, Sparkles, FileText, ExternalLink, Camera, Upload } from "lucide-react";
import Image from "next/image";
import { apiClient } from "@/api/axios";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const [user, setUser] = useState<any>({
    name: "Rahul Sharma",
    email: "student@example.com",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop",
  });
  const [subStatus, setSubStatus] = useState<any>(null);
  const [resume, setResume] = useState<any>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser({
          name: parsed.username?.split('@')[0] || "Rahul Sharma",
          email: parsed.username || "student@example.com",
          photo: parsed.profile_picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"
        });
      } catch (e) {}
    }

    fetchSubStatus();
    fetchResume();
  }, []);

  const fetchSubStatus = async () => {
    try {
      const res = await apiClient.get('/subscribe/status/student@example.com');
      setSubStatus(res.data);
    } catch (e) {}
  };

  const fetchResume = async () => {
    try {
      const stored = localStorage.getItem('app_user');
      const email = stored ? JSON.parse(stored).username : 'student@example.com';
      const res = await apiClient.get(`/resume/${email}`);
      setResume(res.data);
    } catch (e) {}
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', user.email);

    try {
      const res = await apiClient.post('/profile/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success("Profile photo updated successfully!");
        setUser((prev: any) => ({ ...prev, photo: res.data.photo }));
        
        // Update local storage
        const stored = localStorage.getItem('app_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.profile_picture = res.data.photo;
          localStorage.setItem('app_user', JSON.stringify(parsed));
          window.dispatchEvent(new Event('app_user_update'));
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingResume(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', user.email);

    try {
      const res = await apiClient.post('/profile/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success("Resume uploaded successfully!");
        setResume({ content: { uploaded: true, url: res.data.resumeUrl } });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
            <div className="absolute -bottom-10 left-8 relative group cursor-pointer inline-block">
              <Image
                src={user.photo}
                alt={user.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover"
              />
              <div 
                onClick={() => photoInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {uploadingPhoto ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="text-white" size={24} />
                )}
              </div>
              <input 
                type="file" 
                ref={photoInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          <div className="pt-14 pb-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 capitalize">{user.name}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                <Mail size={14} className="text-blue-600" />
                <span>{user.email}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/applications"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
              >
                My Applications <ExternalLink size={14} />
              </Link>
              <Link
                href="/resume-builder"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl hover:bg-indigo-100 transition"
              >
                Resume Builder (₹50) <FileText size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Plan</div>
              <div className="text-xl font-extrabold text-gray-900 mt-1">{subStatus?.plan_name || 'Free'} Plan</div>
              <div className="text-xs text-gray-600 mt-1">
                Limit: {subStatus?.application_limit === null ? 'Unlimited' : `${subStatus?.application_limit || 1} Apps/mo`}
              </div>
            </div>
            <Link href="/pricing" className="bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs px-3 py-2 rounded-xl hover:bg-amber-100 transition flex items-center gap-1">
              <Sparkles size={14} /> Upgrade
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attached Profile Resume</div>
              <div className="text-xl font-extrabold text-gray-900 mt-1">
                {resume ? 'Attached & Verified' : 'Not Created Yet'}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {resume ? 'Available for 1-Click Applications' : 'Upload or use Resume Builder'}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link href="/resume-builder" className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs px-3 py-2 rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-1">
                <FileText size={14} /> {resume ? 'Update' : 'Create'}
              </Link>
              <button 
                onClick={() => resumeInputRef.current?.click()}
                disabled={uploadingResume}
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs px-3 py-2 rounded-xl hover:bg-gray-100 transition flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {uploadingResume ? (
                   <span className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Upload size={14} /> 
                )}
                Upload PDF
              </button>
              <input 
                type="file" 
                ref={resumeInputRef} 
                onChange={handleResumeUpload} 
                accept="application/pdf" 
                className="hidden" 
              />
            </div>
          </div>
        </div>

        <LoginHistory />
      </div>
    </div>
  );
}
