'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { BookOpen, Sparkles, ChevronRight, GraduationCap, Trophy } from 'lucide-react';
import api from '../lib/api';
import AIRecommended from './components/ai/AIRecommended';
import { Skeleton } from './components/ui/Skeleton';

import AICareerPreview from './components/home/AICareerPreview';

export default function Home() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCareerSuite, setShowCareerSuite] = useState(false);

  const categories = [
    "All", "Python", "Artificial Intelligence", "Machine Learning", 
    "Java", "Web Development", "Data Science"
  ];

  useEffect(() => {
    api.get('/subjects').then(res => {
      setSubjects(res.data.slice(0, 6)); // Show top 6
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-10 py-4 text-lg font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-10 py-4 text-lg font-bold rounded-2xl text-indigo-600 bg-white border-2 border-indigo-50 hover:bg-gray-50 transition-all"
              >
                Login to Dashboard
              </Link>
            </div>

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

        {/* Toggle Button for AI Career Suite */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowCareerSuite(!showCareerSuite)}
            className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <Sparkles className={`w-5 h-5 ${showCareerSuite ? 'animate-spin' : ''}`} />
            {showCareerSuite ? "Hide AI Career Suite" : "Explore AI Career Suite"}
          </button>
        </div>

        {/* 🚀 Expandable AI Career Suite */}
        {showCareerSuite && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            <AICareerPreview />
          </section>
        )}

        {/* Popular Courses */}
        <section id="catalog" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Popular Courses</h2>
              <p className="text-gray-500 font-medium">Start learning from our top-rated tracks</p>
            </div>
            <Link href="/subjects" className="text-indigo-600 font-bold hover:underline flex items-center gap-1 group text-sm">
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
                <Link href={`/learn/${subject.id}`} key={subject.id} className="group">
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full">
                    <div className="aspect-video bg-gray-50 relative overflow-hidden">
                      {subject.thumbnail_url ? (
                        <img src={subject.thumbnail_url} alt={subject.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <BookOpen className="w-12 h-12" />
                        </div>
                      )}
                      {subject.is_free && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-lg shadow-lg">Free</div>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{subject.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">{subject.description}</p>
                      
                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                          <BookOpen className="w-3 h-3" />
                          Self-Paced
                        </span>
                        <span className="text-indigo-600 font-extrabold flex items-center gap-1 text-sm">
                          Start Now
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer-like CTA */}
      <div className="bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to start your journey?</h2>
          <p className="text-gray-400 text-lg mb-10 font-medium">Join thousands of students and build the future you've always dreamed of.</p>
          <Link
            href="/register"
            className="inline-block px-12 py-5 bg-white text-gray-900 font-extrabold rounded-2xl text-xl hover:bg-gray-100 transition-all shadow-2xl"
          >
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  );
}
