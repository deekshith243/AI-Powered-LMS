'use client';

import { useEffect, useState, useMemo } from 'react';
import { Sparkles, MapPin, Briefcase, IndianRupee, ExternalLink, Filter } from 'lucide-react';
import api from '@/lib/api';

const CATEGORIES = ["All", "Developer", "Data", "AI/ML", "Cloud"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      const data = res.data;
      // Backend returns an array directly now
      let results = Array.isArray(data) ? data : (data.results || []);
      setJobs(results);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (job: any) => {
    window.open(job.redirect_url || 'https://careers.google.com', '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    if (activeFilter === "All") return jobs;
    return jobs.filter(job => {
      const text = `${job.title} ${job.company?.display_name || ''} ${job.description || ''}`.toLowerCase();
      if (activeFilter === "Developer") return text.includes('developer') || text.includes('engineer') || text.includes('backend') || text.includes('frontend') || text.includes('fullstack');
      if (activeFilter === "Data") return text.includes('data') || text.includes('analyst') || text.includes('scientist');
      if (activeFilter === "AI/ML") return text.includes('ai') || text.includes('ml') || text.includes('machine learning') || text.includes('intelligence');
      if (activeFilter === "Cloud") return text.includes('cloud') || text.includes('aws') || text.includes('azure') || text.includes('gcp') || text.includes('devops');
      return true;
    });
  }, [jobs, activeFilter]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Fetching global opportunities...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-16 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white font-bold text-sm mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Direct Tech Opportunities
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">🚀 Jobs</h1>
            <p className="text-indigo-100 max-w-2xl mx-auto text-lg mb-8">
                Explore 30+ verified roles from global tech giants and innovative startups.
            </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 relative z-20">
          <div className="flex items-center px-4 md:mr-2 md:border-r border-gray-100 text-gray-400">
            <Filter className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Filter By</span>
          </div>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeFilter === cat 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dense Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredJobs.map((job: any, index) => {
              return (
                <div key={job.id || index} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full group p-5 min-h-[300px] relative">

                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                            <Briefcase className="w-5 h-5" />
                        </div>
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-1">
                        {job.company?.display_name || 'Tech Company'}
                    </h2>

                    <p className="text-gray-600 text-sm font-medium mb-3 line-clamp-1">
                        {job.title}
                    </p>

                    <div className="space-y-2 mb-5">
                        <div className="flex items-center text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                            <MapPin className="w-3 h-3 mr-1.5 text-indigo-400" />
                            📍 {job.location?.display_name || 'Remote/India'}
                        </div>
                        {job.salary_min && (
                            <div className="flex items-center text-sm text-emerald-600 font-extrabold tracking-tight">
                                <IndianRupee className="w-3.5 h-3.5 mr-1" />
                                {job.salary_min.toLocaleString()} {job.salary_max ? `- ${job.salary_max.toLocaleString()}` : ''}
                            </div>
                        )}
                    </div>


                    <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-3">
                        <details className="group/details">
                            <summary className="cursor-pointer text-indigo-600 font-bold text-[11px] flex items-center gap-1 hover:underline list-none uppercase tracking-widest">
                                Quick View
                                <span className="group-open/details:rotate-180 transition-transform duration-300 transform inline-block">▼</span>
                            </summary>
                            <div className="p-3 bg-gray-50 rounded-xl mt-3 border border-gray-100">
                                <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                                    {job.description?.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 150)}...
                                </p>
                            </div>
                        </details>

                        <button
                            onClick={() => handleApply(job)}
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-sm"
                        >
                            Apply Now ↗
                        </button>
                    </div>
                </div>
              );
            })}
        </div>
        
        {filteredJobs.length === 0 && !loading && (
            <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-20 text-center shadow-sm">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No matching jobs</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
        )}
      </div>
    </div>
  );
}
