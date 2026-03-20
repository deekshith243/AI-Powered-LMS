'use client';

import React, { useState } from 'react';
import { ShieldCheck, Upload, Loader2, CheckCircle2, AlertCircle, TrendingUp, Search } from 'lucide-react';
import api from '../../../lib/api';

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
      if (file.type === 'application/pdf') {
        const text = await extractTextfromPDF(file);
        setResumeText(text);
      } else {
        setError('Only PDF files are supported for auto-extraction currently.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to extract text from PDF.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!targetRole || !resumeText) return setError('Please enter target role and resume text.');
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/ats', { resumeText, targetRole });
      setStats(res.data);
    } catch (err) {
      setError('Analysis failed. Please try again.');
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="md:col-span-1 premium-card p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32 mb-4 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 * (1 - stats.score / 100)}
                  className="text-purple-500 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-white">{stats.score}%</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">ATS Score</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 premium-card p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
               <AlertCircle className="w-5 h-5 text-pink-400" />
               Key Improvements
            </h3>
            <ul className="space-y-2">
              {stats.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 premium-card p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-400" />
              Missing Keywords & Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.missing_skills.map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                  {s}
                </span>
              ))}
              {stats.required_skills.map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
