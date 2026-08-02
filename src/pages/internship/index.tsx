import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiClient } from "@/api/axios";
import { ArrowUpRight, Banknote, Calendar, Filter, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function InternshipListingPage() {
  const [internshipData, setInternshipData] = useState<any[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<any[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filter, setFilter] = useState({ category: "", location: "" });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [isSuggestion, setIsSuggestion] = useState(false);

  useEffect(() => {
    fetchInternships(1, true);
  }, []);

  const fetchInternships = async (pageNum: number, reset: boolean = false) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: "12",
        ...(filter.category && { category: filter.category }),
        ...(filter.location && { location: filter.location })
      });
      const response = await apiClient.get(`/internships?${queryParams.toString()}`);
      const data = response.data.data.map((internship: any) => ({
        id: internship.id || internship._id,
        company: internship.company || internship.company_name,
        company_logo: internship.company_logo || internship.logo_url,
        title: internship.title,
        location: internship.location,
        stipend: internship.stipend,
        duration: internship.duration,
        category: internship.category,
        description: internship.description
      }));
      
      if (reset) {
        setInternshipData(data);
      } else {
        setInternshipData(prev => [...prev, ...data]);
      }
      
      setTotal(response.data.total || 0);
      setHasMore(pageNum < response.data.totalPages);
      setIsSuggestion(response.data.isSuggestion || false);
    } catch (error) {
      console.error("Error fetching internships:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchInternships(nextPage);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchInternships(1, true);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filter.category, filter.location]);

  const clearFilters = () => {
    setFilter({ category: "", location: "" });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Premium Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Discover Premium <span className="text-blue-200">Internships</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto font-medium">
            Kickstart your career with top companies. Apply to the latest opportunities tailored just for you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sticky Sleek Sidebar */}
          <div className="hidden md:block w-72 bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2 font-bold text-gray-900">
                <Filter size={18} className="text-blue-600" />
                <span className="text-lg">Filters</span>
              </div>
              <button onClick={clearFilters} className="text-xs text-blue-600 font-bold hover:text-blue-800 transition">
                Clear all
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filter.category}
                    onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                    className="w-full pl-3 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. Engineering, Design..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filter.location}
                    onChange={(e) => setFilter({ ...filter, location: e.target.value })}
                    className="w-full pl-3 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. Remote, Bangalore..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex items-center justify-between">
              <p className="font-bold text-gray-800">
                {total ? `${total} Internships Available` : 'Internships Available'}
              </p>
              <button
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="md:hidden text-xs font-bold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
              >
                Toggle Filters
              </button>
            </div>

            {isSuggestion && !loading && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl flex items-center shadow-sm">
                <span className="font-semibold text-sm">No exact matches found. Showing popular suggestions instead!</span>
              </div>
            )}

            <div className="space-y-5">
              {loading && internshipData.length === 0 ? (
                <div className="space-y-5">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                      <div className="h-10 bg-gray-100 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : internshipData.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5 text-blue-500">
                    <Filter size={40} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No Internships Found</h3>
                  <p className="text-base text-gray-500 mb-8 max-w-sm">We couldn't find any internships matching your current filters. Try adjusting your search criteria.</p>
                  <button onClick={clearFilters} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    Clear Filters
                  </button>
                </div>
              ) : (
                internshipData.map((internship: any) => (
                  <div
                    key={internship._id || internship.id}
                    className="group bg-white rounded-2xl border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-2 text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-lg text-[11px] font-bold w-fit mb-5 uppercase tracking-wider">
                      <ArrowUpRight size={14} strokeWidth={2.5} />
                      <span>Actively Hiring</span>
                    </div>

                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                          {internship.title}
                        </h2>
                        <p className="text-sm font-semibold text-gray-500">{internship.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600 text-sm mb-5 font-medium">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{internship.location}</span>
                    </div>

                    <div className="flex flex-wrap gap-y-4 gap-x-10 mb-6 text-sm">
                      <div>
                        <div className="flex items-center space-x-1.5 text-gray-400 mb-1.5 text-xs font-semibold uppercase tracking-wide">
                          <Banknote size={14} />
                          <span>Stipend</span>
                        </div>
                        <div className="font-bold text-gray-800">{internship.stipend}</div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5 text-gray-400 mb-1.5 text-xs font-semibold uppercase tracking-wide">
                          <Calendar size={14} />
                          <span>Duration</span>
                        </div>
                        <div className="font-bold text-gray-800">{internship.duration || '3 Months'}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-5">
                      <span className="px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-lg text-xs font-semibold">
                        {internship.category || 'Internship'}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-5 flex justify-end">
                      <Link
                        href={`/detailiternship/${internship._id || internship.id}`}
                        className="text-white bg-blue-600 hover:bg-blue-700 font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
                      >
                        View Details <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
              
              {hasMore && internshipData.length > 0 && !loading && (
                <div className="flex justify-center mt-10">
                  <button 
                    onClick={handleLoadMore} 
                    className="px-8 py-3 bg-white border-2 border-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm hover:shadow-md"
                  >
                    Load More Internships
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
