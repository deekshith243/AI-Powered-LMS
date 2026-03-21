'use client';

import React, { useState } from 'react';
import { PencilLine, Wand2, Loader2, CheckCircle2, AlertCircle, FileEdit, Upload } from 'lucide-react';

const API_URL = "https://lms-backend-prod-3935.onrender.com";

export default function ResumeImprover() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [improvedResume, setImprovedResume] = useState('');
  const [originalResume, setOriginalResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImproveUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!targetRole) {
      alert("Please enter a target role first");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // 1. Extract text via backend
      const formData = new FormData();
      formData.append("file", file);

      const extractRes = await fetch(`${API_URL}/api/ai/extract-pdf`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!extractRes.ok) {
        throw new Error("Failed to extract PDF text");
      }

      const extractData = await extractRes.json();
      const text = extractData.text;

      console.log("--- Improving Resume ---");
      console.log("Sending role:", targetRole);
      
      // 2. Improve resume
      const res = await fetch(`${API_URL}/api/ai/resume-improve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          resumeText: text,
          targetRole
        })
      });

      if (!res.ok) {
        console.error("Improve API error");
        alert("Improvement API failed");
        throw new Error("Improvement API failed");
      }

      const data = await res.json();
      setImprovedResume(data.improved_resume);
      setOriginalResume(text);
      setResumeText(text);
    } catch (err: any) {
      console.error("Improve Error:", err);
      setError(err.message || 'Failed to improve resume. Please try again.');
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
            <label className="text-sm font-medium text-gray-400">
              Upload Resume (PDF / Text)
            </label>
            <input 
              type="file" 
              accept=".pdf,.txt" 
              onChange={handleImproveUpload}
              disabled={loading}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
            />
          </div>
        </form>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4 text-purple-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Optimizing Resume...
          </div>
        )}
      </div>

      {improvedResume && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="premium-card p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-xl">
            <h3 className="text-xl font-bold text-gray-500 mb-6 flex items-center gap-2">
              Original Content
            </h3>
            <div className="whitespace-pre-wrap font-sans text-gray-400 text-sm leading-relaxed bg-white border border-gray-100 p-6 rounded-xl h-[400px] overflow-y-auto">
              {originalResume}
            </div>
          </div>

          <div className="premium-card p-6 rounded-2xl bg-white border-2 border-emerald-500 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-bl-xl shadow-md">
                AI Optimized
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Improved Resume
            </h3>
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap font-sans text-gray-800 text-sm leading-relaxed bg-white border border-gray-200 p-6 rounded-xl h-[400px] overflow-y-auto shadow-inner">
                {improvedResume}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
