import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function Feed() {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', location: '', category: '' });

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.category) params.append('category', filters.category);

      const res = await apiClient.get(`/internships?${params.toString()}`);
      setInternships(res.data);
    } catch (err) {
      toast.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [filters]);

  const handleApply = async (id: string) => {
    try {
      // Assuming no resume file for this basic mock UI (In a real app, use FormData for file upload)
      const formData = new FormData();
      // formData.append('resume', fileInput);
      formData.append('cover_letter', 'I am very interested in this role.');
      
      await apiClient.post(`/applications/apply/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Applied successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to apply (Did you upload a resume?)');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Internship Feed</h1>
      
      <div className="flex gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Search roles or companies" 
          className="border p-2 rounded w-full"
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="Location" 
          className="border p-2 rounded w-64"
          value={filters.location}
          onChange={(e) => setFilters({...filters, location: e.target.value})}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">Loading internships...</div>
      ) : (
        <div className="space-y-6">
          {internships.map(internship => (
            <div key={internship.id} className="bg-white p-6 rounded-lg shadow border border-gray-200 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{internship.title}</h2>
                <p className="text-gray-600 mt-1">{internship.company_name || internship.company}</p>
                <div className="flex gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">📍 {internship.location}</span>
                  <span className="flex items-center gap-1">💰 {internship.stipend}</span>
                  <span className="flex items-center gap-1">⏱️ {internship.duration}</span>
                </div>
              </div>
              <button 
                onClick={() => handleApply(internship.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition"
              >
                Apply Now
              </button>
            </div>
          ))}
          {internships.length === 0 && (
            <div className="text-center py-12 text-gray-500">No internships found matching your criteria.</div>
          )}
        </div>
      )}
    </div>
  );
}
