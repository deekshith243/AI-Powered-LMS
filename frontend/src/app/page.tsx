'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { BookOpen, Sparkles, ChevronRight, GraduationCap, Trophy, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { Skeleton } from './components/ui/Skeleton';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

import AICareerPreview from './components/home/AICareerPreview';
import CourseCard from './components/home/CourseCard';

export default function Home() {
  const { loading: authLoading, isAuth } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCareerSuite, setShowCareerSuite] = useState(false);

  const categories = [
    "All", "Python", "Artificial Intelligence", "Machine Learning", 
    "Java", "Web Development", "Data Science"
  ];

  const router = useRouter();

  useEffect(() => {
    if (isAuth) {
      api.get('/subjects').then(res => {
        setSubjects(res.data.slice(0, 6)); // Show top 6
      }).catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isAuth]);

  if (authLoading || !isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white pt-16 pb-32">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 font-bold text-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
              <Sparkles className="w-4 h-4" />
              Standardized Structural Learning
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
              Learn <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Anything</span>, <br />
              Master Everything.
            </h1>
            
            <p className="max-w-2xl mt-5 mx-auto text-xl text-gray-500 leading-relaxed font-medium">
              A minimalist, AI-powered structural learning platform designed to help you stay focused and achieve your career goals faster.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-400 font-bold text-sm uppercase tracking-widest">
              <div className="flex items-center gap-2"><Trophy className="w-4 h-4" /> 100+ Free Courses</div>
              <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Verified Certificates</div>
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Support</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-20">
        {/* Categories Section */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              className="px-6 py-2 rounded-full border border-gray-100 bg-gray-50 text-gray-600 font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 🚀 AI Career Suite (Restored) */}
        <section className="max-w-7xl mx-auto px-6 py-12 scroll-mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">🚀 AI Career Suite</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="p-6 border border-gray-100 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <h3 className="font-bold text-lg mb-1">Resume Generator</h3>
              <p className="text-sm text-gray-500 mb-4">Build ATS-ready resume</p>
              <Link href="/career/resume" className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1 group">
                Try Now 
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            <div className="p-6 border border-gray-100 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <h3 className="font-bold text-lg mb-1">ATS Score</h3>
              <p className="text-sm text-gray-500 mb-4">Check resume matching</p>
              <Link href="/career/ats" className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1 group">
                Try Now 
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            <div className="p-6 border border-gray-100 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <h3 className="font-bold text-lg mb-1">Improve Resume</h3>
              <p className="text-sm text-gray-500 mb-4">AI-powered polishing</p>
              <Link href="/career/improve" className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1 group">
                Try Now 
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            <div className="p-6 border border-gray-100 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <h3 className="font-bold text-lg mb-1">Mock Interview</h3>
              <p className="text-sm text-gray-500 mb-4">Practice tech interviews</p>
              <Link href="/career/interview" className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1 group">
                Try Now 
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            <div className="p-6 border border-gray-100 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <h3 className="font-bold text-lg mb-1">Career Path</h3>
              <p className="text-sm text-gray-500 mb-4">Roadmap generator</p>
              <Link href="/career/path" className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1 group">
                Try Now 
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Courses */}
        <section id="catalog" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Popular Courses</h2>
              <p className="text-gray-500 font-medium">Start learning from our top-rated tracks</p>
            </div>
            <Link href="/catalog" className="text-indigo-600 font-bold hover:underline flex items-center gap-1 group text-sm">
              View Entire Catalog
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subjects.map((subject) => (
                <CourseCard key={subject.id} subject={subject} />
              ))}
            </div>
          )}
        </section>
      </div>


    </div>
  );
}
