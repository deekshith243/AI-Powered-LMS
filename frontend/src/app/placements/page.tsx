'use client';

import { useEffect, useState } from 'react';
import { Sparkles, MapPin, Briefcase, IndianRupee, ExternalLink } from 'lucide-react';
import api from '@/lib/api';

export default function PlacementsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      const data = res.data;
      let results = data.results || [];
      
      // FALLBACK: If API fails or returns no results (Step 4)
      if (!results || results.length === 0) {
        results = [
          {
            id: 1,
            title: "Software Engineer",
            company: { display_name: "Google" },
            location: { display_name: "Bangalore" },
            redirect_url: "https://google.com/careers",
            description: "Join the core search team to build next-gen search algorithms.",
            salary_min: 1500000,
            salary_max: 2500000
          },
          {
            id: 2,
            title: "Data Analyst",
            company: { display_name: "Amazon" },
            location: { display_name: "Hyderabad" },
            redirect_url: "https://amazon.jobs",
            description: "Analyze customer data to optimize logistics and delivery performance.",
            salary_min: 1200000,
            salary_max: 1800000
          }
        ];
      }
      
      setJobs(results);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      // Fallback on total error
      setJobs([
        {
          id: 1,
          title: "Software Engineer",
          company: { display_name: "Google" },
          location: { display_name: "Bangalore" },
          redirect_url: "#",
          salary_min: 1500000,
          salary_max: 2500000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Fetching real-time opportunities...</p>
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
              Direct Career Placements
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">🚀 Exclusive Job Opportunities</h1>
            <p className="text-indigo-100 max-w-2xl mx-auto text-lg hover:animate-pulse transition-all">
                Your direct path to the tech industry. Explore verified software engineering and data roles at top companies.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {jobs.map((job: any, index) => (
            <div key={job.id || index} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full group p-8">
                
                <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                        <Briefcase className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-lg shadow-sm">New Opening</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                    {job.company.display_name}
                </h2>

                <p className="text-gray-600 font-bold mb-4 text-base italic">
                    {job.title}
                </p>

                <div className="space-y-3 mb-8">
                    <div className="flex items-center text-sm text-gray-500 font-bold">
                        <MapPin className="w-4 h-4 mr-2 text-indigo-400" />
                        📍 {job.location.display_name}
                    </div>
                    {job.salary_min && (
                        <div className="flex items-center text-base text-emerald-600 font-extrabold">
                            <IndianRupee className="w-4 h-4 mr-2" />
                            ₹ {job.salary_min.toLocaleString()} {job.salary_max ? `- ₹ ${job.salary_max.toLocaleString()}` : ''}
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50">
                    <details className="group/details mb-6">
                        <summary className="cursor-pointer text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline list-none">
                            View Details 
                            <span className="group-open/details:rotate-180 transition-transform duration-300 transform inline-block">▼</span>
                        </summary>
                        <div className="p-4 bg-gray-50 rounded-2xl mt-4 border border-gray-100">
                            <p className="text-sm text-gray-500 leading-relaxed font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                                {job.description?.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 300)}...
                            </p>
                        </div>
                    </details>

                    <a
                        href={job.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gray-200 hover:shadow-indigo-200"
                    >
                        Apply Now
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
            ))}
        </div>
        
        {jobs.length === 0 && !loading && (
            <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-20 text-center shadow-sm">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-bounce" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Finding your next big break...</h3>
                <p className="text-gray-500 font-medium">Auto-updating our job board. Check back in a few minutes!</p>
            </div>
        )}
      </div>
    </div>
  );
}
