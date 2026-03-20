'use client';

import React, { useState } from 'react';
import { FileText, ShieldCheck, BrainCircuit, Briefcase } from 'lucide-react';
import ResumeGenerator from './ResumeGenerator';
import ATSAnalyzer from './ATSAnalyzer';
import MockInterview from './MockInterview';
import CareerPathGenerator from './CareerPathGenerator';

export default function CareerSuite() {
  const [activeTab, setActiveTab] = useState<'resume' | 'ats' | 'interview' | 'path'>('resume');

  const tabs = [
    { id: 'resume', name: 'Resume Builder', icon: FileText, color: 'text-blue-400' },
    { id: 'path', name: 'Career Roadmap', icon: Briefcase, color: 'text-emerald-400' },
    { id: 'ats', name: 'ATS Optimizer', icon: ShieldCheck, color: 'text-purple-400' },
    { id: 'interview', name: 'AI Interview', icon: BrainCircuit, color: 'text-indigo-400' },
  ];

  return (
    <section className="mt-12 space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">AI Career Suite</h2>
            <p className="text-gray-400 text-sm">Professional tools to accelerate your career growth</p>
          </div>
        </div>

        <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-gray-600'}`} />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 min-h-[600px]">
        {activeTab === 'resume' && <ResumeGenerator />}
        {activeTab === 'path' && <CareerPathGenerator />}
        {activeTab === 'ats' && <ATSAnalyzer />}
        {activeTab === 'interview' && <MockInterview />}
      </div>
    </section>
  );
}
