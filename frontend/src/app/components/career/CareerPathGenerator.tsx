'use client';

import React, { useState } from 'react';
import { Map, Wand2, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../../lib/api';
import Link from 'next/link';

export default function CareerPathGenerator() {
  const [goal, setGoal] = useState('');
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!goal) return setError('Please enter your career goal.');
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/career', { goal });
      setRoadmap(res.data);
    } catch (err: any) {
      console.error("Career Path Error:", err);
      setError('Failed to generate career roadmap.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
            <Map className="w-8 h-8 text-indigo-600" />
            AI Career Strategic Path
          </h2>
          <p className="text-gray-500 font-medium mb-8">
            Tell us your target role, and our AI will build a professional roadmap with timelines and recommended learning.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="e.g. Senior Frontend Developer, Data Engineer..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 min-w-[200px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? "Generating..." : "Generate Roadmap"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 font-bold">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {roadmap && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-wrap gap-4">
            <div className="bg-emerald-50 text-emerald-700 font-bold px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Total Timeline: {roadmap.total_timeline}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Map className="w-5 h-5 text-indigo-600" /> Step-by-Step Roadmap
              </h3>
              <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                {roadmap.roadmap?.map((step: any, idx: number) => (
                  <div key={idx} className="relative pl-10 group">
                    <div className="absolute left-0 top-1 w-8 h-8 bg-white border-2 border-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 z-10 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {idx + 1}
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                        {step.timeline}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">{step.step}</h4>
                      <div className="flex flex-wrap gap-1">
                        {step.topics?.map((t: string) => (
                          <span key={t} className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded text-[10px] font-medium border border-gray-100">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-fit">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> Expert Recommendations
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.required_skills?.map((s: string) => (
                        <span key={s} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold">{s}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recommended LMS Courses</p>
                    <div className="space-y-2">
                      {roadmap.recommended_courses?.map((c: string) => (
                        <div key={c} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                          <span className="text-sm font-bold text-gray-700">{c}</span>
                          <Link href="/catalog" className="text-indigo-600 font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">ENROLL →</Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
