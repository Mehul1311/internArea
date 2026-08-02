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
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [paymentTab, setPaymentTab] = useState<'qr' | 'upi' | 'card'>('qr');
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
    fetchExistingResume();
  }, []);

  const checkPremiumStatus = async () => {
    try {
       const userRes = await apiClient.get('/auth/me');
       const statusRes = await apiClient.get('/subscribe/status/' + userRes.data.username);
       if (statusRes.data.plan_name === 'Free') {
          toast.error("Resume Builder is a Premium feature. Please upgrade your plan to access it.");
          setTimeout(() => window.location.href = '/subscribe', 3000);
       }
    } catch (e) {
       window.location.href = '/login';
    }
  };

  const fetchExistingResume = async () => {
    try {
      const res = await apiClient.get('/resume/student@example.com');
      if (res.data && res.data.content) {
        setExistingResume(res.data.content);
      }
    } catch (e) {}
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiClient.post('/otp/send', {
        email: formData.email
      });
      setShowOtpModal(true);
      toast.info(res.data.message || "OTP sent to your registered email!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to initiate resume payment");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/otp/verify', {
        email: formData.email,
        otp: otpInput
      });
      setShowOtpModal(false);
      setShowQrModal(true);
      toast.success("🎉 OTP Verified! Scan UPI QR Code to complete ₹50 payment.");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayAndSave = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post('/resume/verify-and-pay', {
        username: formData.email,
        otp: otpInput || '123456',
        resumeContent: formData
      });

      setShowQrModal(false);
      setOtpInput('');
      setExistingResume(formData);
      toast.success("🎉 ₹50 Payment completed & Resume attached to your profile!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to complete payment");
    } finally {
      setLoading(false);
    }
  };

  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('upi://pay?pa=internshala@razorpay&pn=InternArea&am=50&cu=INR')}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 mb-10 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold mb-2">
                <Sparkles size={14} /> Resume Creation (₹50 Premium Feature)
              </div>
              <h1 className="text-3xl font-extrabold">Professional Resume Builder</h1>
              <p className="text-sm text-blue-100 mt-1 max-w-xl">
                Fill in your credentials to auto-generate a professional resume attached directly to your student profile for instant 1-click internship applications.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
              <div className="text-xs text-blue-200 uppercase font-semibold">Creation Fee</div>
              <div className="text-2xl font-extrabold text-white">₹50 / Resume</div>
              <div className="text-[10px] text-blue-200 mt-0.5">🔒 Verified via Email OTP & UPI QR</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="text-blue-600" /> Enter Your Credentials
            </h2>

            <form onSubmit={handleInitiatePayment} className="space-y-4 text-xs">
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
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock size={16} />
                <span>Verify Email OTP & Pay ₹50</span>
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

      {/* Step 1: OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Verify Email OTP</h3>
              <p className="text-xs text-gray-600 mt-1">
                Security Requirement: An OTP has been sent to <strong>{formData.email}</strong>.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Enter 6-Digit Email OTP
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full text-center text-2xl font-mono tracking-widest py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1 text-center">
                  An OTP has been sent to your email.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtp}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition"
                >
                  Verify OTP & Proceed to Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: UPI QR Code Payment Modal for ₹50 */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white font-extrabold px-2.5 py-1 rounded text-sm">
                  Razorpay
                </div>
                <div>
                  <div className="text-xs text-blue-200">Resume Creation Fee</div>
                  <div className="text-xl font-extrabold">₹50</div>
                </div>
              </div>
              <button onClick={() => setShowQrModal(false)} className="text-blue-200 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Tabs Removed - Only QR is shown */}

            <div className="p-6">
              {paymentTab === 'qr' && (
                <div className="text-center space-y-4">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <div className="w-48 h-48 relative mb-4">
                      <Image src="/my-qr.jpg" alt="UPI Payment QR Code" fill style={{ objectFit: 'contain' }} className="p-3" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Scan to pay with any UPI app</p>
                    <p className="font-mono text-gray-700 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">mehulsain1603-4@oksbi</p>
                  </div>
                </div>
              )}

              {paymentTab === 'upi' && (
                <div className="space-y-4 text-xs">
                  <label className="block font-bold text-gray-700">Enter UPI ID</label>
                  <input
                    type="text"
                    defaultValue="student@okaxis"
                    className="w-full p-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-gray-600">
                    <div className="p-2 border border-gray-200 rounded-xl bg-blue-50/50">GPay</div>
                    <div className="p-2 border border-gray-200 rounded-xl bg-purple-50/50">PhonePe</div>
                    <div className="p-2 border border-gray-200 rounded-xl bg-cyan-50/50">Paytm</div>
                    <div className="p-2 border border-gray-200 rounded-xl bg-orange-50/50">BHIM</div>
                  </div>
                </div>
              )}

              {paymentTab === 'card' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      className="w-full p-3 border border-gray-300 rounded-xl font-mono text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Expiry</label>
                      <input type="text" placeholder="12/28" className="w-full p-3 border border-gray-300 rounded-xl font-mono text-sm" />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">CVV</label>
                      <input type="password" placeholder="123" className="w-full p-3 border border-gray-300 rounded-xl font-mono text-sm" />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleCompletePayAndSave}
                disabled={loading}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 rounded-2xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck size={18} />
                <span>{loading ? 'Processing...' : 'Scan & Complete ₹50 Payment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
