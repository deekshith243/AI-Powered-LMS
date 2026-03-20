'use client';

import React, { useState } from 'react';
import { PencilLine, Wand2, Loader2, CheckCircle2, AlertCircle, FileEdit, Upload } from 'lucide-react';
import api from '../../../lib/api';

export default function ResumeImprover() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [improvedResume, setImprovedResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const extractTextfromPDF = async (file: File) => {
    try {
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
        // Fallback for .txt or other files
        const text = await file.text();
        setResumeText(text);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to extract text from file.');
    } finally {
      setUploading(false);
    }
  };

  const handleImprove = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!resumeText || !targetRole) {
      return setError('Please provide both your resume file (or text) and a target role.');
    }
    setLoading(true);
    setError('');

    console.log("--- Improving Resume ---");
    console.log("Target Role:", targetRole);
    console.log("Resume Text Length:", resumeText.length);
    console.log("Endpoint: /api/ai/resume-improve");

    try {
      const res = await api.post('/ai/resume-improve', { 
        resumeText, 
        targetRole 
      });
      console.log("Improve Response:", res.data);
      setImprovedResume(res.data.improved_resume);
    } catch (err: any) {
      console.error("Improve Error:", err);
      setError(err.response?.data?.message || 'Failed to improve resume. Please try again.');
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
            <label className="text-sm font-medium text-gray-400 flex justify-between items-center">
              Current Resume
              <label className="text-xs text-purple-400 cursor-pointer hover:underline flex items-center gap-1">
                <Upload className="w-3 h-3" />
                Upload PDF / Text
                <input type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
            </label>
            {uploading ? (
              <div className="h-40 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Processing file...
              </div>
            ) : (
              <textarea
                placeholder="Paste your resume content or upload a file above..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="premium-card p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-xl">
            <h3 className="text-xl font-bold text-gray-500 mb-6 flex items-center gap-2">
              Original Content
            </h3>
            <div className="whitespace-pre-wrap font-sans text-gray-400 text-sm leading-relaxed bg-white border border-gray-100 p-6 rounded-xl h-[400px] overflow-y-auto">
              {resumeText}
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
