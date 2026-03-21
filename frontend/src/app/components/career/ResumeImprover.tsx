'use client';

import React, { useState } from 'react';
import { Briefcase, Wand2, Loader2, CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';

export default function ResumeImprover() {
  const [targetRole, setTargetRole] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [improvedResume, setImprovedResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImprove = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!resumeText) {
      alert("Please paste your resume text first");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch("/api/ai/improve-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resumeText,
          targetRole
        })
      });

      if (!res.ok) throw new Error("Optimization failed");

      const data = await res.json();
      setImprovedResume(data.improved || "Optimization failed. Please try again.");
    } catch (err: any) {
      console.error("Improve Error:", err);
      setError(err.message || 'Failed to improve resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const splitText = doc.splitTextToSize(improvedResume, pageWidth - margin * 2);
    doc.text(splitText, margin, 20);
    doc.save(`Improved_Resume.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="premium-card p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-400" />
          AI Resume Improver
        </h2>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Target Role (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Senior Software Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Current Resume Text</label>
            <textarea
              placeholder="Paste your current resume here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 h-48 transition-all"
            />
          </div>
        </form>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <button
          onClick={handleImprove}
          disabled={loading || !resumeText}
          className="premium-button w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(5,150,105,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
        <div className="premium-card p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Improved Resume
            </h3>
            <button
               onClick={downloadPDF}
               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all border border-emerald-500/30"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed bg-white border border-gray-200 p-6 rounded-xl">
              {improvedResume}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
