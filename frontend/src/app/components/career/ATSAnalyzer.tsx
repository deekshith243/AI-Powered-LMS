'use client';

import React, { useState } from 'react';
import { ShieldCheck, Upload, Loader2, CheckCircle2, AlertCircle, TrendingUp, Search } from 'lucide-react';

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
  const [stats, setStats] = useState<ATSStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const extractTextfromPDF = async (file: File) => {
    try {
      // Dynamic import to avoid top-level issues with pdfjs-dist in Next.js
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const strings = textContent.items.map((item: any) => item.str);
        fullText += strings.join(' ') + '\n';
      }
      return fullText;
    } catch (err) {
      console.error('PDF Extraction Error:', err);
      throw new Error('Failed to extract text from PDF. Please check the file format.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/ai/extract-pdf`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error("Failed to extract PDF text from backend");
      }

      const data = await res.json();
      setResumeText(data.text);
      console.log("File uploaded and text extracted via backend");
    } catch (err: any) {
      setError(err.message || 'Failed to extract text from file.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetRole || !resumeText) return setError('Please enter target role and resume text.');
    setLoading(true);
    setError('');
    
    console.log("--- ATS Analysis ---");
    console.log("Sending role:", targetRole);
    console.log(`Endpoint: ${API_URL}/api/ai/ats`);

    try {
      const res = await fetch(`${API_URL}/api/ai/ats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          resumeText,
          targetRole
        })
      });

      if (!res.ok) {
        console.error("API error");
        alert("Something went wrong");
        throw new Error("API error");
      }

      const data = await res.json();
      console.log("ATS Response:", data);
      setStats(data);
    } catch (err: any) {
      console.error("ATS Error:", err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="premium-card p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          ATS Resume Analyzer
        </h2>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 mb-6">
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex justify-between items-center">
              Resume Text
              <label className="text-xs text-purple-400 cursor-pointer hover:underline flex items-center gap-1">
                <Upload className="w-3 h-3" />
                Upload PDF
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              </label>
            </label>
            {uploading ? (
              <div className="h-40 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Extracting text from PDF...
              </div>
            ) : (
              <textarea
                placeholder="Paste your resume text here or upload a PDF above..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-40 transition-all text-sm font-mono"
              />
            )}
          </div>
        </form>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || uploading}
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
