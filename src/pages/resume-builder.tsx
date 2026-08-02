import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/axios';
import { toast } from 'react-toastify';
import { FileText, Lock, Sparkles, CheckCircle2, QrCode, CreditCard, ShieldCheck, X } from 'lucide-react';
import Image from 'next/image';

export default function ResumeBuilderPage() {
  const [formData, setFormData] = useState({
    fullName: 'Rahul Sharma',
    email: 'student@example.com',
    phone: '9876543210',
    location: 'Bangalore, India',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop',
    degree: 'B.Tech in Computer Science & Engineering',
    college: 'IIT Bangalore',
    gradYear: '2025',
    skills: 'React, Next.js, Node.js, TypeScript, PostgreSQL, Tailwind CSS',
    experience: 'Frontend Development Intern at Tech Corp (3 Months) - Built responsive user interfaces and integrated REST APIs.',
    summary: 'Enthusiastic and detail-oriented web developer passionate about building high-performance web applications.'
  });

  const [existingResume, setExistingResume] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExistingResume();
  }, []);

  const fetchExistingResume = async () => {
    try {
      const res = await apiClient.get('/resume/student@example.com');
      if (res.data && res.data.content) {
        setExistingResume(res.data.content);
        setFormData(res.data.content);
      }
    } catch (e) {}
  };

  const handleSaveResume = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiClient.post('/resume/save', {
        username: formData.email,
        resumeContent: formData
      });

      setExistingResume(formData);
      toast.success("🎉 Resume saved and attached to your profile!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 mb-10 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold mb-2">
                <Sparkles size={14} /> Free Resume Builder
              </div>
              <h1 className="text-3xl font-extrabold">Professional Resume Builder</h1>
              <p className="text-sm text-blue-100 mt-1 max-w-xl">
                Fill in your credentials to auto-generate a professional resume attached directly to your student profile for instant 1-click internship applications.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="text-blue-600" /> Enter Your Credentials
            </h2>

            <form onSubmit={handleSaveResume} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Photo URL</label>
                <input
                  type="text"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Highest Qualification / Degree</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">College / University</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Key Technical Skills</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Work / Internship Experience</label>
                <textarea
                  rows={2}
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Personal Summary</label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>{loading ? 'Saving...' : 'Save & Attach to Profile'}</span>
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
              <span>Resume Live Preview</span>
              {existingResume && (
                <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={14} /> Attached to Profile
                </span>
              )}
            </h2>

            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
                {formData.photoUrl && (
                  <div className="relative w-16 h-16 rounded-full border-2 border-blue-600 overflow-hidden">
                    <Image src={formData.photoUrl} alt="Student Profile" fill style={{ objectFit: 'cover' }} />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">{formData.fullName || 'Student Name'}</h3>
                  <div className="text-xs text-gray-600 flex flex-wrap gap-3 mt-1">
                    <span>📧 {formData.email}</span>
                    <span>📞 {formData.phone}</span>
                    <span>📍 {formData.location}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Professional Summary</h4>
                <p className="text-xs text-gray-700 leading-relaxed">{formData.summary}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Education & Qualifications</h4>
                <div className="text-xs font-bold text-gray-900">{formData.degree}</div>
                <div className="text-xs text-gray-600">{formData.college} (Batch of {formData.gradYear})</div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Experience</h4>
                <p className="text-xs text-gray-700 leading-relaxed">{formData.experience}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Key Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {formData.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-md text-[11px]">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
