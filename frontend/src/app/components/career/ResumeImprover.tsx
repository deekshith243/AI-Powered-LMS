'use client';

import React, { useState } from 'react';
import { PencilLine, Wand2, Loader2, CheckCircle2, AlertCircle, FileEdit, Upload } from 'lucide-react';
import { extractTextFromPDF } from '@/lib/pdfParser';

const API_URL = "https://lms-backend-prod-3935.onrender.com";

export default function ResumeImprover() {
  const [resumeText, setResumeText] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [improvedResume, setImprovedResume] = useState('');
  const [originalResume, setOriginalResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [uploading, setUploading] = useState(false);

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
      setPdfText(text);
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

  const handleImprove = async () => {
    const finalText = resumeText;
    if (!finalText) {
      alert("Please paste resume or upload PDF");
      return;
    }
    if (!targetRole) {
      setInfo("ℹ️ Please enter a target role");
      return;
    }

    setLoading(true);
    setInfo('');
    
    try {
      const res = await fetch(`${API_URL}/api/ai/resume-improve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          resumeText: finalText,
          targetRole
        })
      });

      if (!res.ok) {
        alert("API error");
        throw new Error("Improvement API failed");
      }

      const data = await res.json();
      setImprovedResume(data.improved_resume);
      setOriginalResume(finalText);
    } catch (err: any) {
      console.error("Improve Error:", err);
      setInfo('ℹ️ Optimization failed. Please try again.');
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
          Paste your existing resume or upload a PDF to get an industry-optimized, keyword-rich version.
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
                Upload PDF
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              </label>
            </label>
            

            <textarea
              placeholder="Paste your current resume content here (recommended if PDF upload fails)..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-32 transition-all text-sm font-mono"
            />

            <div className="flex justify-between items-center text-[10px] text-gray-400 px-1 italic">
              <span>Tip: Copy your resume from Word for best results</span>
              <button 
                type="button"
                onClick={() => {
                  setResumeText("");
                  setPdfText("");
                  setInfo("");
                }}
                className="text-purple-400 hover:underline font-bold"
              >
                ✍️ Paste Instead
              </button>
            </div>

            {uploading && (
                <div className="flex items-center gap-2 text-purple-400 text-sm py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting PDF...
                </div>
            )}

            {pdfText && !uploading && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="text-emerald-400 text-xs font-bold mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        PDF uploaded successfully
                    </div>
                    <div className="text-gray-400 text-[10px] line-clamp-2 italic">
                        Preview: {pdfText.substring(0, 200)}...
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
          onClick={handleImprove}
          disabled={loading || uploading || !resumeText}
          className="premium-button w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
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
