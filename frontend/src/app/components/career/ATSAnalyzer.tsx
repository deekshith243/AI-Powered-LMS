'use client';
// Vercel deployment cache-buster: 2026-03-21T13:46

import React, { useState } from 'react';
import { ShieldCheck, Upload, Loader2, CheckCircle2, AlertCircle, TrendingUp, Search } from 'lucide-react';
import { extractTextFromPDF } from '@/lib/pdfParser';

const API_URL = "https://lms-backend-prod-3935.onrender.com";

interface ATSStats {
  score: number;
  missing_skills: string[];
  suggestions: string[];
  required_skills: string[];
}

export default function ATSAnalyzer() {
  const [targetRole, setTargetRole] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [stats, setStats] = useState<ATSStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [uploading, setUploading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [isJobMatchMode, setIsJobMatchMode] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setInfo('');
    console.log("Uploading file:", file.name);
    
    try {
      const text = await extractTextFromPDF(file);
      
      if (!text || text.length < 20) {
        throw new Error("Invalid or empty PDF");
      }

      setResumeText(text);   // Sync textarea
      setExtractedText(text);
      setInfo("✅ Resume uploaded successfully");
      console.log("PDF text extracted and synchronized to textarea");
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
    const finalText = resumeText;
    if (!targetRole || !finalText) return setInfo('ℹ️ Please enter target role and provide resume (paste or PDF).');
    
    setLoading(true);
    setInfo('');
    
    try {
      const res = await fetch(`${API_URL}/api/ai/ats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resumeText: finalText,
          targetRole
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const data = await res.json();

      setStats({
        score: data?.score || 0,
        missing_skills: data?.missing_skills || [],
        suggestions: data?.suggestions || [],
        required_skills: data?.required_skills || []
      });

    } catch (err) {
      console.error("ATS ERROR:", err);
      setInfo("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="premium-card p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            {isJobMatchMode ? "AI Job Match Matcher" : "ATS Resume Analyzer"}
          </h2>
          <button 
            onClick={() => {
              setIsJobMatchMode(!isJobMatchMode);
              setStats(null);
            }}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest px-3 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20"
          >
            Switch to {isJobMatchMode ? "ATS Mode" : "Job Match Mode"}
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 mb-6">
          {!isJobMatchMode ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Target Role</label>
              <input
                type="text"
                placeholder="e.g. Senior Backend Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Job Description (JD)</label>
              <textarea
                placeholder="Paste the Job Description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-32 transition-all text-sm font-sans"
              />
            </div>
          )}

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

            {extractedText && !uploading && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="text-emerald-400 text-xs font-bold mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        PDF uploaded successfully
                    </div>
                    <div className="text-gray-400 text-[10px] line-clamp-2 italic">
                        Preview: {extractedText.substring(0, 100)}...
                    </div>
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
          disabled={loading || uploading || !resumeText || (isJobMatchMode && !jobDescription)}
          className="premium-button w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isJobMatchMode ? "Matching Resume..." : "Analyzing with AI..."}
            </>
          ) : (
            <>
              {isJobMatchMode ? <ShieldCheck className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              {isJobMatchMode ? "Analyze Job Match" : "Check ATS Compatibility"}
            </>
          )}
        </button>
      </div>

      {stats && (
        <div className="premium-card p-6 rounded-2xl bg-gray-50 border border-gray-100 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
              ATS Analysis Result
            </h3>
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-purple-100 shadow-sm">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Score</span>
              <span className="text-3xl font-extrabold text-purple-600">{stats.score}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-5 rounded-xl bg-emerald-50 border border-emerald-100">
              <h4 className="text-emerald-700 font-bold flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Key Suggestions
              </h4>
              <ul className="space-y-2">
                {stats.suggestions.map((s: string, i: number) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 p-5 rounded-xl bg-purple-50 border border-purple-100">
              <h4 className="text-purple-700 font-bold flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                Missing Critical Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {stats.missing_skills.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-white text-purple-700 border border-purple-200 rounded-full text-xs font-bold shadow-sm">
                    {skill}
                  </span>
                ))}
                {stats.required_skills.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-white text-blue-700 border border-blue-200 rounded-full text-xs font-bold shadow-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
