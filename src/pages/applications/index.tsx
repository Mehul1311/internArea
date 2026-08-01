import React, { useEffect, useState } from "react";
import { apiClient } from "@/api/axios";
import { Building2, Mail, FileText } from "lucide-react";
import Link from "next/link";

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('app_user');
      const userId = storedUser ? JSON.parse(storedUser).id || 1 : 1;
      const res = await apiClient.get(`/applications/my-applications?userId=${userId}`);
      setApplications(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app: any) => {
    const matchesSearch =
      (app.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && (app.status || 'pending').toLowerCase() === filter;
  });

  const getStatusColor = (status: string) => {
    switch ((status || 'pending').toLowerCase()) {
      case "accepted":
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 p-8">
            <h1 className="text-2xl font-extrabold text-gray-900">My Internship Applications</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track the status of your applied internships and view application responses.
            </p>
          </div>

          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1 w-full relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by role or company name..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
                />
                <Mail className="absolute top-3 left-3 text-gray-400" size={18} />
              </div>

              <div className="flex gap-2">
                {['all', 'pending', 'accepted', 'rejected'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                      filter === f
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-4">Internship & Company</th>
                  <th className="p-4">Stipend</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Resume Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                      No applications found. <Link href="/internship" className="text-blue-600 font-bold hover:underline">Browse internships</Link> to apply!
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app: any) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-bold text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{app.title || 'Internship Role'}</div>
                            <div className="text-xs text-gray-500 font-medium">{app.company_name} • {app.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-800">{app.stipend || '₹20,000 /mo'}</td>
                      <td className="p-4 font-medium text-gray-500">
                        {new Date(app.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                          {(app.status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-blue-600 flex items-center gap-1.5">
                        <FileText size={14} />
                        <span>{app.resume_url || 'Profile Resume'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
