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
        <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Map className="w-5 h-5 text-indigo-600" /> Your Personalized Roadmap
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Target Timeline</p>
                <p className="text-indigo-900 font-bold">{roadmap?.timeline || "3-6 Months"}</p>
             </div>
             <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Key Skills</p>
                <p className="text-emerald-900 font-bold">{roadmap?.skills?.slice(0, 3).join(", ") || "Technical Skills"}</p>
             </div>
          </div>

          <div className="space-y-4 mb-8">
             {roadmap?.steps?.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-50 hover:border-indigo-100 transition-colors bg-white shadow-sm">
                   <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</div>
                   <p className="text-gray-700 font-medium pt-1 text-sm">{step}</p>
                </div>
             ))}
          </div>

          <div className="prose prose-indigo max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-sm bg-gray-50 p-6 rounded-2xl border border-gray-100">
              {typeof roadmap?.roadmap === 'string' ? roadmap.roadmap : "Check the steps above for your roadmap."}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
