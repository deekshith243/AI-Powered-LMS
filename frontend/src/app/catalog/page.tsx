'use client';

import { useEffect, useState } from 'react';
import { Loader2, Sparkles, Filter } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import CourseCard from '../components/home/CourseCard';
import { Skeleton } from '../components/ui/Skeleton';

export default function CatalogPage() {
  const { loading: authLoading, isAuth } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = [
    "All", "Python", "Artificial Intelligence", "Machine Learning", 
    "Java", "Web Development", "Data Science"
  ];

  useEffect(() => {
    if (isAuth) {
      api.get('/subjects')
        .then((res: any) => {
          setSubjects(res.data);
        })
        .catch((err: any) => {
          console.error("Failed to fetch catalog", err);
        })
        .finally(() => setLoading(false));
    }
  }, [isAuth]);

  const filteredSubjects = activeFilter === "All" 
    ? subjects 
    : subjects.filter(s => s.category === activeFilter);

  if (authLoading || !isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Loading Catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 py-16 px-4 text-center">
        <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 font-bold text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              Full Learning Catalog
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Explore Courses</h1>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
                Master new skills with our AI-powered structured courses. From Python to AI, we have everything you need to grow.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Categories / Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2 rounded-full border font-bold text-sm transition-all ${
                activeFilter === cat 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : filteredSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSubjects.map((subject) => (
              <CourseCard key={subject.id} subject={subject} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-300" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
             <p className="text-gray-500 font-medium">Try another category or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
