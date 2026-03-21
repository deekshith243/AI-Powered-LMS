'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { FileText, ShieldCheck, BrainCircuit, Briefcase } from 'lucide-react';
import ResumeGenerator from './ResumeGenerator';
import ATSAnalyzer from './ATSAnalyzer';
import MockInterview from './MockInterview';
import CareerPathGenerator from './CareerPathGenerator';
import ResumeImprover from './ResumeImprover';

import { aiCareerRoutes } from '@/config/aiCareerRoutes';

export default function CareerSuite() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'resume' | 'ats' | 'improve' | 'interview' | 'path'>('resume');

  React.useEffect(() => {
    // Check pathname for /dashboard or /career routes
    if (pathname.includes('/resume')) setActiveTab('resume');
    else if (pathname.includes('/ats')) setActiveTab('ats');
    else if (pathname.includes('/improve')) setActiveTab('improve');
    else if (pathname.includes('/mock') || pathname.includes('/interview')) setActiveTab('interview');
    else if (pathname.includes('/career-path') || pathname.includes('/career/path')) setActiveTab('path');
    else {
      // Fallback to search params for backward compatibility
      const tab = searchParams.get('tab');
      if (tab && ['resume', 'ats', 'improve', 'interview', 'path'].includes(tab)) {
        setActiveTab(tab as any);
      }
    }
  }, [pathname, searchParams]);

  const tabs = [
    { id: 'resume', name: 'Resume', icon: FileText, color: 'text-blue-600', route: aiCareerRoutes.resume },
    { id: 'ats', name: 'ATS Score', icon: ShieldCheck, color: 'text-purple-600', route: aiCareerRoutes.ats },
    { id: 'improve', name: 'Improve Resume', icon: Briefcase, color: 'text-emerald-600', route: aiCareerRoutes.improve },
    { id: 'interview', name: 'Interview', icon: BrainCircuit, color: 'text-indigo-600', route: aiCareerRoutes.mock },
    { id: 'path', name: 'Career Path', icon: Briefcase, color: 'text-emerald-600', route: aiCareerRoutes.career },
  ];

  return (
    <section className="mt-12 space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">🚀 AI Career Suite</h2>
            <p className="text-gray-500 text-sm font-medium">Professional tools to accelerate your career growth</p>
          </div>
        </div>

        <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push(tab.route)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300 font-bold ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-gray-600'}`} />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

        {activeTab === 'resume' && <ResumeGenerator />}
        {activeTab === 'ats' && <ATSAnalyzer />}
        {activeTab === 'improve' && <ResumeImprover />}
        {activeTab === 'interview' && <MockInterview />}
        {activeTab === 'path' && <CareerPathGenerator />}
    </section>
  );
}
