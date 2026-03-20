'use client';

import React, { useState } from 'react';
import { PencilLine, Wand2, Loader2, CheckCircle2, AlertCircle, FileEdit } from 'lucide-react';
import api from '../../../lib/api';

export default function ResumeImprover() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [improvedResume, setImprovedResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImprove = async () => {
    if (!resumeText || !targetRole) {
      return setError('Please provide both your resume text and a target role.');
    }
    setLoading(true);
    setError('');
    try {
      console.log("Improving resume for role:", targetRole);
      const res = await api.post('/ai/resume-improve', { resumeText, targetRole });
      setImprovedResume(res.data.improved_resume);
    } catch (err: any) {
      console.error("Improve Error:", err);
      setError('Failed to improve resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="premium-card p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
          <PencilLine className="w-6 h-6 text-purple-400" />
          AI Resume Improver
        </h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Paste your existing resume and target role to get an industry-optimized, keyword-rich version that beats the ATS.
        </p>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Target Role</label>
            <input
              type="text"
              placeholder="e.g. Senior Product Manager"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Current Resume Text</label>
            <textarea
              placeholder="Paste your resume content here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-48 transition-all text-sm font-mono"
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
          onClick={handleImprove}
          disabled={loading}
          className="premium-button w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
               <Loader2 className="w-5 h-5 animate-spin" />
               Optimizing Resume...
            </>
          ) : (
            <>
               <FileEdit className="w-5 h-5" />
               Improve My Resume
            </>
          )}
        </button>
      </div>

      {improvedResume && (
        <div className="premium-card p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Optimized Resume Content
          </h3>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed bg-white border border-gray-200 p-6 rounded-xl">
              {improvedResume}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
