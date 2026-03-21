'use client';
// Force redeploy - AI Career Suite Visibility Fix

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Skeleton } from '../components/ui/Skeleton';
import Link from 'next/link';
import { BookOpen, AlertCircle, Sparkles, Download, BarChart2, Award, Zap, Eye, BrainCircuit, ChevronRight, Briefcase, FileText, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

import dynamic from 'next/dynamic';

const AIInsightsComp = dynamic(() => Promise.resolve(AIInsights), { ssr: false });

interface UserProfile {
  name: string;
  email: string;
  role: string;
  points: number;
  streak: number;
  badges?: any[];
}

interface EnrolledSubject {
  subject_id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  total_videos: number;
  completed_videos: number;
  percent_complete: number;
}

function AIInsights() {
  const [insights, setInsights] = useState<any>(null);
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsRes, recsRes] = await Promise.all([
          api.post('/ai/dashboard-insights'),
          api.get('/ai/recommendations/me')
        ]);
        setInsights(insightsRes.data);
        setRecs(recsRes.data.recommendations || []);
      } catch (err) {
        console.error("Failed to fetch AI data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="mb-12 p-8 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 animate-pulse">
      <div className="h-6 w-48 bg-indigo-200 rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-white rounded"></div>
        <div className="h-4 w-2/3 bg-white rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="mb-12 animate-fade-in">
      {insights && (
        <>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-3 text-amber-500" />
            AI Career Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
              <h4 className="text-emerald-700 font-bold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Your Strengths
              </h4>
              <ul className="space-y-2">
                {insights.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
              <h4 className="text-amber-700 font-bold mb-3 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> Growth Areas
              </h4>
              <ul className="space-y-2">
                {insights.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {recs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" /> Recommended For You
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recs.map((rec, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm hover:border-indigo-200 transition">
                <h5 className="font-bold text-gray-900 text-sm mb-1">{rec.title}</h5>
                <p className="text-[10px] text-gray-500 line-clamp-2">{rec.reason}</p>
                <Link href="/catalog" className="text-indigo-600 text-[10px] font-bold mt-2 inline-block hover:underline">Explore Course →</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights?.next_steps && (
        <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl text-white shadow-lg border border-indigo-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <ChevronRight className="w-4 h-4" /> Strategic Next Step
            </h4>
            <p className="text-indigo-100 text-sm leading-relaxed">
              {insights.next_steps?.[0]}
            </p>
          </div>
          <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
        </div>
      )}
    </div>
  );
}

import { CheckCircle2 } from 'lucide-react';


export default function Profile() {
  const { user: authUser } = useAuthStore();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subjects, setSubjects] = useState<EnrolledSubject[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingCert, setDownloadingCert] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      console.log("Dashboard loaded");
      try {
        const [profileRes, appliedRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/job-tracker/applied')
        ]);
        setUser(profileRes.data.user);
        setSubjects(profileRes.data.enrolled_subjects);
        setAppliedJobs(appliedRes.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [authUser]);

  const handleDownloadCertificate = async (subjectId: number) => {
     setDownloadingCert(subjectId);
     try {
       const res = await api.get(`/certificates/${subjectId}`, { responseType: 'blob' });
       const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', `Certificate_${subjectId}.pdf`);
       document.body.appendChild(link);
       link.click();
       link.remove();
     } catch (err: any) {
       setError(err.response?.data?.message || 'Failed to download certificate.');
     } finally {
       setDownloadingCert(null);
     }
  };

  const handlePreviewCertificate = async (subjectId: number) => {
     setDownloadingCert(subjectId);
     try {
       const res = await api.get(`/certificates/${subjectId}`, { responseType: 'blob' });
       const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
       window.open(url, '_blank');
     } catch (err: any) {
       setError(err.response?.data?.message || 'Failed to preview certificate.');
     } finally {
       setDownloadingCert(null);
     }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-32 w-full mb-8 rounded-2xl" />
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full text-red-600 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load profile</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Try Again
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">My Dashboard</h1>



      {/* Personal Info */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{user.name}</h2>
           <p className="text-gray-500 mt-1">{user.email}</p>
        </div>
        <div className="hidden sm:flex items-center space-x-6">
           {/* Points & Streak Display */}
           <div className="flex flex-col items-end">
              <div className="flex items-center text-amber-500 font-bold text-xl">
                 <Zap className="w-6 h-6 mr-1 fill-amber-500" />
                 {user.points || 0} Points
              </div>
              <div className="flex items-center text-orange-600 font-semibold text-sm mt-1">
                 <Sparkles className="w-4 h-4 mr-1" />
                 {user.streak || 0} Day Streak
              </div>
           </div>
           <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl border-4 border-white shadow-sm">
              {user.name.charAt(0).toUpperCase()}
           </div>
        </div>
      </div>

      {/* Badges Section */}
      {user.badges && user.badges.length > 0 && (
        <div className="mb-12 animate-fade-in">
           <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="w-6 h-6 mr-3 text-purple-600" />
              Achievements
           </h3>
           <div className="flex flex-wrap gap-4">
              {user.badges.map((badge, idx) => (
                 <div key={idx} className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-purple-100 flex items-center space-x-3 premium-card">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                       <Award className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-900">{badge.name}</p>
                       <p className="text-[10px] text-gray-500">{badge.description}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Embedded Analytics Dashboard */}
      <div className="mb-12">
         <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BarChart2 className="w-6 h-6 mr-3 text-indigo-600" />
            Learning Analytics
         </h3>
         
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BookOpen className="w-8 h-8" />
               </div>
               <div>
                  <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
               </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Award className="w-8 h-8" />
               </div>
               <div>
                  <p className="text-sm font-medium text-gray-500">Certificates Earned</p>
                  <p className="text-2xl font-bold text-gray-900">{subjects.filter(s => s.percent_complete === 100).length}</p>
               </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
               <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Zap className="w-8 h-8" />
               </div>
               <div>
                  <p className="text-sm font-medium text-gray-500">Average Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                     {subjects.length > 0 ? Math.round(subjects.reduce((sum, s) => sum + s.percent_complete, 0) / subjects.length) : 0}%
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* 🔮 AI Insights Section */}
      <AIInsights />

      {/* 🚀 Applied Jobs Tracker (Feature 2) */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Briefcase className="w-6 h-6 mr-3 text-orange-600" />
          Applied Jobs Tracker
        </h3>
        {appliedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No jobs applied yet. Head to Placements to start your career!</p>
            <Link href="/placements" className="text-indigo-600 font-bold text-sm mt-3 inline-block hover:underline">Browse Jobs →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appliedJobs.map((job, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900">{job.company}</h4>
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">{job.status}</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">{job.role}</p>
                <p className="text-[10px] text-gray-400 mt-auto pt-3">{new Date(job.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* Enrolled Subjects */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Continue Learning</h3>
        
        {subjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No enrolled subjects yet</h3>
            <p className="text-gray-500 mb-6">Discover our catalog and start your learning journey today.</p>
            <Link href="/subjects" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {subjects.map((subject) => (
              <Link href={`/learn/${subject.subject_id}`} key={subject.subject_id} className="block group">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-1/4 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {subject.thumbnail_url ? (
                        <img src={subject.thumbnail_url} alt={subject.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <BookOpen className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{subject.title}</h4>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{subject.description}</p>
                      
                      <div className="mt-4 flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${subject.percent_complete}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 w-8">{subject.percent_complete}%</span>
                      </div>
                      
                      {subject.percent_complete === 100 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-4">
                           <button 
                             onClick={(e) => { e.preventDefault(); handlePreviewCertificate(subject.subject_id); }}
                             disabled={downloadingCert === subject.subject_id}
                             className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
                           >
                              <Eye className="w-4 h-4 mr-1.5" /> Preview
                           </button>
                           <button 
                             onClick={(e) => { e.preventDefault(); handleDownloadCertificate(subject.subject_id); }}
                             disabled={downloadingCert === subject.subject_id}
                             className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
                           >
                              {downloadingCert === subject.subject_id ? (
                                <span className="flex items-center">Loading...</span>
                              ) : (
                                <><Download className="w-4 h-4 mr-1.5" /> Download</>
                              )}
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
