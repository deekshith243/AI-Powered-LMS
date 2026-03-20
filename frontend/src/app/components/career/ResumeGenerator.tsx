'use client';

import React, { useState } from 'react';
import { FileText, Download, Wand2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';
import jsPDF from 'jspdf';

export default function ResumeGenerator() {
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
 
  // Debug log for role
  console.log("Resume Role:", role);

  const handleGenerate = async () => {
    if (!role) return setError('Please enter a target role.');
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/resume', { role, name, skills });
      setResume(res.data.resume);
    } catch (err: any) {
      setError('Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const splitText = doc.splitTextToSize(resume, pageWidth - margin * 2);
    doc.text(splitText, margin, 20);
    doc.save(`${role.replace(/\s+/g, '_')}_Resume.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="premium-card p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-blue-400" />
          AI Resume Generator
        </h2>

        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Target Role</label>
            <input
              type="text"
              placeholder="e.g. Full Stack Developer"
              value={role}
              onChange={(e) => {
                console.log("Typing role:", e.target.value);
                setRole(e.target.value);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Full Name (Optional)</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-400">Key Skills (Optional)</label>
            <textarea
              placeholder="React, Node.js, TypeScript, AWS..."
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-24 transition-all"
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
          onClick={handleGenerate}
          disabled={loading}
          className="premium-button w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate Magic Resume
            </>
          )}
        </button>
      </div>

      {resume && (
        <div className="premium-card p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Generated Resume
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
              {resume}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
