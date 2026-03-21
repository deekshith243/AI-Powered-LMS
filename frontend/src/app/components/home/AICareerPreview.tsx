'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ShieldCheck, Zap, BrainCircuit, Briefcase, ChevronRight } from 'lucide-react';

const AICareerPreview = () => {
  const router = useRouter();

  const previewCards = [
    {
      title: "Resume Generator",
      description: "AI-powered professional resume builder tailored for your career goals.",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      tab: "resume"
    },
    {
      title: "ATS Score Checker",
      description: "Check your compatibility with any job description and optimize for success.",
      icon: ShieldCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      tab: "ats"
    },
    {
      title: "Improve Resume",
      description: "Optimize keywords and professional impact with intelligent suggestions.",
      icon: Zap,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      tab: "improve"
    },
    {
      title: "Mock Interview",
      description: "Practice with our AI interviewer and get instant feedback for improvement.",
      icon: BrainCircuit,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      tab: "interview"
    },
    {
      title: "Career Path",
      description: "Generate a step-by-step roadmap to achieve your dream career goals.",
      icon: Briefcase,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      tab: "career"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">AI Career Suite</h2>
          <p className="text-gray-500 text-sm font-medium">Professional tools to accelerate your career growth</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {previewCards.map((card, i) => (
          <div 
            key={i}
            className="group bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden relative flex flex-col h-full"
          >
            {/* Background Accent */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${card.bgColor} rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700`}></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className={`w-14 h-14 ${card.bgColor} ${card.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">{card.description}</p>
              
              <button 
                onClick={() => router.push(`/dashboard?tab=${card.tab}`)}
                className={`flex items-center gap-2 font-bold text-sm ${card.color} hover:gap-3 transition-all`}
              >
                Try Now
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AICareerPreview;
