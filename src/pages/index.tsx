import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  ArrowUpRight,
  Banknote,
  Calendar,
  ChevronRight,
  MapPin,
  Sparkles,
  Search
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/api/axios";

export default function SvgSlider() {
  const categories = [
    "All Categories",
    "Engineering",
    "Design",
    "Data Science",
    "Media",
    "Big Brands",
    "Work From Home",
  ];

  const slides = [
    {
      title: "Start Your Dream Career Journey",
      subtitle: "Find top internships and entry-level jobs with leading companies",
      bgColor: "bg-gradient-to-r from-blue-600 to-indigo-700",
    },
    {
      title: "Learn & Earn with Top Tech Giants",
      subtitle: "Verified opportunities with competitive stipends up to ₹35,000/mo",
      bgColor: "bg-gradient-to-r from-indigo-600 to-purple-700",
    },
    {
      title: "Public Space Community Feed",
      subtitle: "Connect with peers, share knowledge, and build your professional network",
      bgColor: "bg-gradient-to-r from-teal-600 to-emerald-700",
    },
  ];

  const stats = [
    { number: "300K+", label: "companies hiring" },
    { number: "10K+", label: "new openings everyday" },
    { number: "21Mn+", label: "active students" },
    { number: "600K+", label: "learners" },
  ];

  const [internships, setInternship] = useState<any[]>([]);
  const [jobs, setJob] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [internshipPage, setInternshipPage] = useState(1);
  const [jobPage, setJobPage] = useState(1);
  const [hasMoreInternships, setHasMoreInternships] = useState(true);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const [loadingMoreInternships, setLoadingMoreInternships] = useState(false);
  const [loadingMoreJobs, setLoadingMoreJobs] = useState(false);

  const fetchHomepageData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: "1",
        limit: "30",
        ...(selectedCategory !== "All Categories" && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery })
      });
      
      const [internshipRes, jobRes] = await Promise.all([
        apiClient.get(`/external/internships?${queryParams.toString()}`),
        apiClient.get(`/external/jobs?${queryParams.toString()}`),
      ]);
      
      const rawInternships = internshipRes.data;
      const rawJobs = jobRes.data;

      setInternship(rawInternships?.data || []);
      setInternshipPage(1);
      setHasMoreInternships(1 < (rawInternships?.totalPages || 1));

      setJob(rawJobs?.data || []);
      setJobPage(1);
      setHasMoreJobs(1 < (rawJobs?.totalPages || 1));
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchHomepageData();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery]);

  const loadMoreInternships = async () => {
    try {
      setLoadingMoreInternships(true);
      const nextPage = internshipPage + 1;
      const queryParams = new URLSearchParams({
        page: nextPage.toString(),
        limit: "30",
        ...(selectedCategory !== "All Categories" && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery })
      });
      const res = await apiClient.get(`/external/internships?${queryParams.toString()}`);
      setInternship(prev => [...prev, ...(res.data?.data || [])]);
      setInternshipPage(nextPage);
      setHasMoreInternships(nextPage < (res.data?.totalPages || 1));
    } catch (error) {
      console.error("Error loading more internships:", error);
    } finally {
      setLoadingMoreInternships(false);
    }
  };

  const loadMoreJobs = async () => {
    try {
      setLoadingMoreJobs(true);
      const nextPage = jobPage + 1;
      const queryParams = new URLSearchParams({
        page: nextPage.toString(),
        limit: "30",
        ...(selectedCategory !== "All Categories" && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery })
      });
      const res = await apiClient.get(`/external/jobs?${queryParams.toString()}`);
      setJob(prev => [...prev, ...(res.data?.data || [])]);
      setJobPage(nextPage);
      setHasMoreJobs(nextPage < (res.data?.totalPages || 1));
    } catch (error) {
      console.error("Error loading more jobs:", error);
    } finally {
      setLoadingMoreJobs(false);
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Make your dream career a reality ✨
        </h1>
        <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
          Trending on InternArea 🔥 Apply to thousands of verified internships and full-time jobs!
        </p>

        {/* Global Search Bar */}
        <div className="mt-8 max-w-xl mx-auto flex items-center bg-white border border-gray-300 rounded-full px-5 py-3 shadow-md focus-within:ring-2 focus-within:ring-blue-500">
          <Search size={20} className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search by role, skill, or company (e.g. Frontend, Google...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-gray-800 text-sm font-medium"
          />
        </div>
      </div>

      {/* Swiper Hero Slider */}
      <div className="mb-14">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          className="rounded-2xl overflow-hidden shadow-xl"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className={`relative h-[280px] sm:h-[340px] ${slide.bgColor} flex flex-col items-center justify-center p-8 text-center text-white`}>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">{slide.title}</h2>
                <p className="text-lg text-blue-100 max-w-xl font-medium">{slide.subtitle}</p>
                <div className="mt-6 flex gap-4">
                  <Link href="/internship" className="bg-white text-blue-700 font-bold px-6 py-2.5 rounded-full hover:bg-blue-50 transition shadow-lg text-sm">
                    Browse Internships
                  </Link>
                  <Link href="/community" className="bg-blue-900/40 backdrop-blur-md border border-white/30 text-white font-bold px-6 py-2.5 rounded-full hover:bg-blue-900/60 transition text-sm">
                    Join Community Space
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Category Filter Pills */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>Latest Internships</span>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full">Actively Hiring</span>
          </h2>
          <Link href="/internship" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
            View All Internships <ChevronRight size={16} />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Internship Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <>
          <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {internships.map((internship: any) => (
              <div
                key={internship._id || internship.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                      <ArrowUpRight size={14} /> Actively Hiring
                    </span>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{internship.category}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-blue-600 transition">
                    {internship.title}
                  </h3>
                  <p className="text-sm font-semibold text-gray-600 mb-4">{internship.company}</p>

                  <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{internship.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Banknote size={16} className="text-gray-400" />
                      <span className="font-semibold text-gray-800">{internship.stipend}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{internship.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                    Internship
                  </span>
                  <Link
                    href={`/detailiternship/${internship._id || internship.id}`}
                    className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1"
                  >
                    View Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {hasMoreInternships && (
            <div className="flex justify-center mb-16">
              <button
                onClick={loadMoreInternships}
                disabled={loadingMoreInternships}
                className="px-8 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
              >
                {loadingMoreInternships ? 'Loading...' : 'Load More Internships'}
              </button>
            </div>
          )}
        </div>

      {/* Jobs Grid */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Latest Jobs</h2>
          <Link href="/job" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
            View All Jobs <ChevronRight size={16} />
          </Link>
        </div>

        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {jobs.map((job: any) => (
              <div
                key={job._id || job.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                      Full-time Job
                    </span>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{job.category}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-blue-600 transition">
                    {job.title}
                  </h3>
                  <p className="text-sm font-semibold text-gray-600 mb-4">{job.company}</p>

                  <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Banknote size={16} className="text-gray-400" />
                      <span className="font-semibold text-gray-800">{job.CTC}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{job.Experience}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">
                    Job
                  </span>
                  <Link
                    href={`/detailjob/${job._id || job.id}`}
                    className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1"
                  >
                    View Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {hasMoreJobs && (
            <div className="flex justify-center mb-16">
              <button
                onClick={loadMoreJobs}
                disabled={loadingMoreJobs}
                className="px-8 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
              >
                {loadingMoreJobs ? 'Loading...' : 'Load More Jobs'}
              </button>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl shadow-xl p-8 mb-12 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-300 mb-1">{stat.number}</div>
              <div className="text-xs sm:text-sm text-blue-100 uppercase tracking-wider font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
