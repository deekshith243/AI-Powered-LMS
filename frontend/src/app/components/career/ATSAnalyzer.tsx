'use client';

import React, { useState } from 'react';
import { ShieldCheck, Upload, Loader2, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { extractTextFromPDF } from '@/lib/pdfParser';

export default function ATSAnalyzer() {
  const [targetRole, setTargetRole] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState<{
    score: number;
    matched: string[];
    missing: string[];
    suggestions: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setInfo('');
    
    try {
      const text = await extractTextFromPDF(file);
      if (!text || text.length < 20) throw new Error("Invalid or empty PDF");

      setResumeText(text);
      setInfo("✅ Resume uploaded successfully");
    } catch (err: any) {
      console.error("PDF process handled:", err);
      setResumeText("");
      setInfo("Couldn't read PDF. Please paste your resume below.");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetRole || !resumeText) {
        setInfo('ℹ️ Please enter target role and provide resume (paste or PDF).');
        return;
    }
    
    setLoading(true);
    setInfo('');
    
    try {
      const res = await fetch("/api/ai/ats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resumeText,
          targetRole
        })
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      setResult({
        score: data.score ?? 0,
        matched: data.matched_skills ?? [],
        missing: data.missing_skills ?? [],
        suggestions: data.suggestions ?? []
      });

      setInfo("✅ AI ATS Analysis completed");

    } catch (err) {
      console.error("ATS FRONTEND ERROR:", err);
      alert("Failed to analyze resume. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="premium-card p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            ATS Resume Analyzer
          </h2>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Target Job Role</label>
            <input
              type="text"
              placeholder="e.g. Data Analyst"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex justify-between items-center">
              Your Resume
              <label className="text-xs text-purple-400 cursor-pointer hover:underline flex items-center gap-1">
                <Upload className="w-3 h-3" />
                Upload PDF
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              </label>
            </label>
            
            <textarea
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-32 transition-all text-sm font-mono"
            />

            {uploading && (
                <div className="flex items-center gap-2 text-purple-400 text-sm py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting PDF...
                </div>
            )}
          </div>
        </form>

        {info && (
          <div className="bg-blue-100 text-blue-800 p-3 rounded mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {info}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || uploading || !resumeText}
          className="premium-button w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              Check ATS Compatibility
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="premium-card p-6 rounded-2xl bg-gray-50 border border-gray-100 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
              AI Match Analysis Result
            </h3>
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-purple-100 shadow-sm">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Score</span>
              <span className="text-3xl font-extrabold text-purple-600">{result.score || 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-5 rounded-xl bg-emerald-50 border border-emerald-100">
              <h4 className="text-emerald-700 font-bold flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Matched Skills ✅
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {result.matched?.map((skill, i) => (
                  <li key={i} className="text-xs text-emerald-800 font-medium">{skill}</li>
                ))}
                {result.matched?.length === 0 && <span className="text-xs text-gray-400 italic">No specific matches found.</span>}
              </ul>
            </div>

            <div className="space-y-4 p-5 rounded-xl bg-rose-50 border border-rose-100">
              <h4 className="text-rose-700 font-bold flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                Missing Critical Skills ❌
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {result.missing?.map((skill, i) => (
                  <li key={i} className="text-xs text-rose-800 font-medium">{skill}</li>
                ))}
                {result.missing?.length === 0 && <span className="text-xs text-gray-400 italic">Excellent! No major missing skills detected.</span>}
              </ul>
            </div>

            <div className="md:col-span-2 space-y-4 p-5 rounded-xl bg-purple-50 border border-purple-100">
                <h4 className="text-purple-700 font-bold flex items-center gap-2 text-sm font-sans uppercase tracking-widest">
                    <TrendingUp className="w-4 h-4" />
                    AI Improvement Strategy 💡
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.suggestions?.map((s, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-3 bg-white/50 p-3 rounded-lg border border-purple-100/50">
                            <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                            </div>
                            {s}
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
