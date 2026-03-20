'use client';

import React, { useState } from 'react';
import { Map, Wand2, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../../lib/api';

export default function CareerPathGenerator() {
  const [goal, setGoal] = useState('');
  const [roadmap, setRoadmap] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug log for goal
  console.log("Career Path Goal:", goal);

  const handleGenerate = async () => {
    if (!goal) return setError('Please enter your career goal.');
    setLoading(true);
    setError('');
    try {
      console.log("Generating career path for:", goal);
      const res = await api.post('/ai/career', { goal });
      setRoadmap(res.data.roadmap);
    } catch (err: any) {
      console.error("Career Path Error:", err);
      setError('Failed to generate career roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="premium-card p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
          <Map className="w-6 h-6 text-emerald-400" />
          AI Career Roadmap
        </h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Define your dream role and let our AI chart the perfect learning path for you, from foundations to expert level.
        </p>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Your Career Goal</label>
            <input
              type="text"
              placeholder="e.g. Senior DevOps Engineer, AI Research Scientist..."
              value={goal}
              onChange={(e) => {
                console.log("Typing goal:", e.target.value);
                setGoal(e.target.value);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
            />
          </div>
        </form>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="premium-button w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Charting Path...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Roadmap
            </>
          )}
        </button>
      </div>

      {roadmap && (
        <div className="premium-card p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Your Personalized Roadmap
          </h3>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed bg-white border border-gray-200 p-6 rounded-xl">
              {roadmap}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
