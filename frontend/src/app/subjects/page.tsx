'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import Link from 'next/link';
import { Skeleton } from '../components/ui/Skeleton';
import { AlertCircle, BookX, Search } from 'lucide-react';

interface Subject {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  price?: number;
  is_free?: boolean;
}

const getCategory = (subject: Subject) => {
  const title = subject.title.toLowerCase();
  
  if (title.includes('python')) return 'Python';
  if (title.includes('java') && !title.includes('full stack')) return 'Java';
  if (title.includes('artificial intelligence') || title.includes(' ai ')) return 'AI';
  if (title.includes('machine learning')) return 'ML';
  if (title.includes('web') || title.includes('frontend') || title.includes('full stack') || title.includes('mern')) return 'Web Dev';
  if (title.includes('aws') || title.includes('cloud')) return 'Cloud';
  if (title.includes('devops') || title.includes('docker') || title.includes('kubernetes')) return 'DevOps';
  
  return 'Other';
};

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const TABS = ['All', 'Python', 'Java', 'AI', 'ML', 'Web Dev', 'Cloud', 'DevOps'];

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        setSubjects(res.data);
      } catch (error: any) {
        setError(error.message || 'Failed to load subjects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Network Error</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition">
          Retry Request
        </button>
      </div>
    );
  }

  // Filter Logic
  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === 'All') return matchesSearch;
    
    const category = getCategory(sub);
    return matchesSearch && category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-20 px-4 sm:px-6 lg:px-8 shadow-inner overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
           <div className="absolute top-32 -left-20 w-72 h-72 bg-purple-400 opacity-20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            Upgrade Your Skills with AI-Powered Learning
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto font-light">
            Explore free and premium courses designed for real-world success. Master the tech of tomorrow, today.
          </p>
          
          <div className="relative max-w-2xl mx-auto drop-shadow-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 rounded-xl border-0 text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-indigo-300 transition-shadow text-lg"
              placeholder="What do you want to learn?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* 3. CATEGORY FILTERS */}
        <div className="bg-white p-2 rounded-xl shadow-md border border-gray-100 flex overflow-x-auto hide-scrollbar space-x-2">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeCategory === tab 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {loading ? (
          /* 7. LOADING SKELETON */
          <div>
            <Skeleton className="h-8 w-64 mb-6 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse flex flex-col h-[400px]">
                  <div className="h-48 w-full bg-gray-200"></div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded mb-6"></div>
                    <div className="mt-auto h-10 w-full bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center shadow-sm">
            <BookX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h2>
            <p className="text-gray-500">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* 6. SECTION DIVIDERS (if showing All) */}
            {activeCategory === 'All' && !searchQuery ? (
              <>
                <section>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center">
                    <span className="mr-2 text-orange-500">🔥</span> Popular Courses
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSubjects.slice(0, 4).map(sub => <CourseCard key={sub.id} subject={sub} />)}
                  </div>
                </section>
                
                <hr className="border-gray-200" />
                
                <section>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center">
                    <span className="mr-2 text-indigo-500">📚</span> All Courses
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSubjects.map(sub => <CourseCard key={sub.id} subject={sub} />)}
                  </div>
                </section>
              </>
            ) : (
              <section>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b border-gray-200 pb-2">
                  {searchQuery ? 'Search Results' : activeCategory}
                </h2>
                {/* 4. GRID LAYOUT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredSubjects.map(sub => <CourseCard key={sub.id} subject={sub} />)}
                </div>
              </section>
            )}

          </div>
        )}
      </div>

    </div>
  );
}

// 2. IMPROVED COURSE CARDS
function CourseCard({ subject }: { subject: Subject }) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 flex flex-col h-[400px] overflow-hidden group relative">
      
      {/* Badges */}
      <div className="absolute top-3 right-3 z-10">
        {subject.is_free ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500 text-white shadow-md">
            Free
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-600 text-white shadow-md">
            ₹{subject.price}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div className="h-48 w-full bg-gray-200 overflow-hidden relative">
        {subject.thumbnail_url ? (
          <img 
            src={subject.thumbnail_url} 
            alt={subject.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
            <BookX className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-sm font-medium">No Thumbnail</span>
          </div>
        )}
        {/* Subtle overlay gradient to ensure badge stands out */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {subject.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 flex-grow mb-4">
          {subject.description}
        </p>
        
        {/* View Course Button */}
        <Link
          href={`/learn/${subject.id}`}
          className="w-full block text-center px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
        >
          View Course
        </Link>
      </div>
    </div>
  );
}
