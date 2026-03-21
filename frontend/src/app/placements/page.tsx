'use client';

import { useEffect, useState } from 'react';
import { Sparkles, MapPin, Briefcase, IndianRupee, ExternalLink } from 'lucide-react';

export default function PlacementsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await fetch(
        `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${process.env.NEXT_PUBLIC_ADZUNA_APP_ID}&app_key=${process.env.NEXT_PUBLIC_ADZUNA_APP_KEY}&what=software+engineer+OR+data+analyst+OR+AI&where=india&max_days_old=7`
      );
      const data = await res.json();

      setJobs(data.results || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
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
        <p className="text-gray-500 font-medium animate-pulse">Fetching latest opportunities...</p>
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
            <p className="text-indigo-100 max-w-2xl mx-auto text-lg">
                Your direct path to the tech industry. Explore verified software engineering and data roles at top companies.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job: any, index) => (
            <div key={index} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full group">
                <div className="p-8 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                            <Briefcase className="w-7 h-7" />
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-lg">New Opening</span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                        {job.company.display_name}
                    </h2>

                    <p className="text-gray-600 font-semibold mb-4 text-sm line-clamp-2 leading-relaxed">
                        {job.title}
                    </p>

                    <div className="space-y-3 mb-8">
                        <div className="flex items-center text-sm text-gray-500 font-medium">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {job.location.display_name}
                        </div>
                        {job.salary_min && (
                            <div className="flex items-center text-sm text-emerald-600 font-bold">
                                <IndianRupee className="w-4 h-4 mr-2" />
                                ₹{job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()}
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-50">
                        <details className="group/details mb-6">
                            <summary className="cursor-pointer text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline list-none">
                                View Details 
                                <span className="group-open/details:rotate-180 transition-transform duration-300">▼</span>
                            </summary>
                            <p className="text-sm text-gray-500 mt-4 leading-relaxed font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                                {job.description.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 300)}...
                            </p>
                        </details>

                        <a
                            href={job.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-indigo-200"
                        >
                            Apply Now
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
            ))}
        </div>
        
        {jobs.length === 0 && !loading && (
            <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-20 text-center">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No current openings</h3>
                <p className="text-gray-500">Check back later or explore our courses to boost your profile.</p>
            </div>
        )}
      </div>
    </div>
  );
}
