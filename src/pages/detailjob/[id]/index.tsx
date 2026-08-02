import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiClient } from "@/api/axios";
import { Building2, MapPin, Banknote, Calendar, ChevronRight, Share2, BookmarkPlus, ArrowUpRight, CheckCircle2, Clock, X } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { toast } from "react-toastify";

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const reduxUser = useSelector(selectuser);
  const [jobData, setJobData] = useState<any>(null);
  const [availability, setAvailability] = useState("Yes, I am available to join immediately");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("I am very interested in this full-time role and have strong technical skills to contribute.");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await apiClient.get(`/external/detail/${id}`);
        setJobData({
          id: res.data._id || res.data.id,
          company: res.data.company,
          title: res.data.title,
          location: res.data.location,
          CTC: res.data.CTC,
          Experience: res.data.Experience,
          category: res.data.category,
          aboutCompany: res.data.aboutCompany || "A leading company.",
          description: res.data.description,
          apply_link: null
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmitApplication = async () => {
    if (!coverLetter.trim()) {
      toast.error("Please write a cover letter");
      return;
    }
    if (!reduxUser?.id) {
      toast.error("Please login to apply");
      router.push('/login');
      return;
    }
    try {
      setSubmitting(true);
      const res = await apiClient.post(`/applications/apply-job/${id}`, {
        cover_letter: coverLetter,
        userId: reduxUser.id
      });
      toast.success(res.data.message || "Application submitted successfully!");
      setIsModalOpen(false);
      router.push('/applications');
    } catch (error: any) {
      const errMsg = error.response?.data?.error || "Failed to submit application";
      toast.error(`⚠️ ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!jobData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center text-xs font-bold text-gray-500 mb-6 space-x-2 uppercase tracking-wider">
          <Link href="/" className="hover:text-purple-600 transition">Home</Link>
          <ChevronRight size={14} />
          <Link href="/job" className="hover:text-purple-600 transition">Jobs</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900">{jobData.title}</span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-gray-100 relative">
            <div className="absolute top-8 right-8 flex space-x-3">
              <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition">
                <Share2 size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition">
                <BookmarkPlus size={20} />
              </button>
            </div>

            <div className="flex items-center space-x-2 text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold w-fit mb-5">
              <ArrowUpRight size={14} />
              <span>Actively Hiring</span>
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{jobData.title}</h1>
            <div className="flex items-center space-x-3 text-lg font-semibold text-gray-600 mb-8">
              <Building2 size={20} className="text-purple-600" />
              <span>{jobData.company}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm">
              <div>
                <div className="flex items-center space-x-1.5 text-gray-500 font-bold mb-1 uppercase text-xs tracking-wider">
                  <MapPin size={14} />
                  <span>Location</span>
                </div>
                <p className="font-semibold text-gray-900">{jobData.location}</p>
              </div>
              <div>
                <div className="flex items-center space-x-1.5 text-gray-500 font-bold mb-1 uppercase text-xs tracking-wider">
                  <Banknote size={14} />
                  <span>CTC</span>
                </div>
                <p className="font-semibold text-gray-900">{jobData.CTC}</p>
              </div>
              <div>
                <div className="flex items-center space-x-1.5 text-gray-500 font-bold mb-1 uppercase text-xs tracking-wider">
                  <Calendar size={14} />
                  <span>Experience</span>
                </div>
                <p className="font-semibold text-gray-900">{jobData.Experience}</p>
              </div>
              <div>
                <div className="flex items-center space-x-1.5 text-gray-500 font-bold mb-1 uppercase text-xs tracking-wider">
                  <Clock size={14} />
                  <span>Category</span>
                </div>
                <p className="font-semibold text-gray-900">{jobData.category}</p>
              </div>
            </div>
          </div>

          <div className="p-8 border-b border-gray-100">
            <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-purple-600" />
              About {jobData.company}
            </h2>
            <div 
              className="text-gray-600 leading-relaxed text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: jobData.aboutCompany || '' }}
            />
          </div>

          <div className="p-8">
            <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-purple-600" />
              About the Job
            </h2>
            <div 
              className="text-gray-600 leading-relaxed text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: jobData.description || '' }}
            />
          </div>

          <div className="p-8 flex justify-center bg-gray-50">
            <button
              onClick={() => {
                if (!reduxUser?.id) {
                  toast.error("Please login to apply");
                  router.push('/login');
                  return;
                }
                setIsModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-base px-10 py-3.5 rounded-2xl transition shadow-lg shadow-purple-500/20"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Apply to {jobData.company}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Cover Letter
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm text-gray-800"
                  placeholder="Why should you be selected for this job?"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Availability
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm text-gray-800"
                >
                  <option value="Yes, I am available to join immediately">Yes, I am available to join immediately</option>
                  <option value="Available in 2 weeks">Available in 2 weeks</option>
                  <option value="Notice period required">Notice period required</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitApplication}
                  disabled={submitting}
                  className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl text-sm hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
