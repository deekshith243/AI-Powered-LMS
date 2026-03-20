'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Skeleton } from '../components/ui/Skeleton';
import Link from 'next/link';
import { BookOpen, AlertCircle, Sparkles, Download, BarChart2, Award, Zap, Eye, BrainCircuit, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

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

export default function Profile() {
  const { user: authUser } = useAuthStore();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subjects, setSubjects] = useState<EnrolledSubject[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingCert, setDownloadingCert] = useState<number | null>(null);

  // Career Path States
  const [careerGoal, setCareerGoal] = useState('');
  const [careerRoadmap, setCareerRoadmap] = useState('');
  const [loadingCareer, setLoadingCareer] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        setUser(res.data.user);
        setSubjects(res.data.enrolled_subjects);
        
        if (authUser?.id) {
           api.get(`/ai/recommendations/${authUser.id}`).then(recRes => {
              setRecommendations(recRes.data.recommendations);
           }).catch(console.error).finally(() => setRecLoading(false));
        } else {
           setRecLoading(false);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
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

  const generateCareerPath = async () => {
    if (!careerGoal.trim()) return;
    setLoadingCareer(true);
    setCareerRoadmap('');
    try {
      const res = await api.post('/ai/career', { goal: careerGoal });
      setCareerRoadmap(res.data.roadmap);
    } catch (err) {
      console.error(err);
      setError('Failed to generate career path.');
    } finally {
      setLoadingCareer(false);
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

      {/* AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
         {/* Career Path Generator */}
         <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-8 shadow-sm flex flex-col premium-card">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center text-orange-800">
               <BrainCircuit className="w-6 h-6 mr-3 text-orange-600" />
               AI Career Path Generator
            </h3>
            <p className="text-sm text-orange-800/70 mb-6">Enter your professional goal, and our AI will chart a learning path for you.</p>
            
            <div className="flex space-x-2 mb-6">
               <input 
                  type="text" 
                  placeholder="e.g. Full Stack Developer, Data Scientist..."
                  className="flex-1 px-4 py-3 rounded-xl border border-orange-200 outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateCareerPath()}
               />
               <button 
                  onClick={generateCareerPath}
                  disabled={loadingCareer || !careerGoal.trim()}
                  className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-md disabled:opacity-50"
               >
                  {loadingCareer ? 'Thinking...' : 'Generate'}
               </button>
            </div>

            {careerRoadmap && (
               <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white max-h-[400px] overflow-y-auto animate-fade-in custom-scrollbar">
                  <div className="prose prose-sm prose-orange max-w-none">
                     <div className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                        {careerRoadmap}
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Recommendations */}
         <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-8 shadow-sm premium-card">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
               <Sparkles className="w-6 h-6 mr-3 text-indigo-600" />
               AI Recommended For You
            </h3>
            
            {recLoading ? (
               <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
               </div>
            ) : recommendations.length === 0 ? (
               <p className="text-gray-500">You've started all available courses! Check back later for new content.</p>
            ) : (
               <div className="space-y-4">
                  {recommendations.map(rec => (
                     <Link href={`/learn/${rec.id}`} key={rec.id}>
                        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-5 hover:shadow-md transition group">
                           <div className="flex items-center justify-between">
                              <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{rec.title}</h4>
                              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                           </div>
                           <p className="text-xs text-gray-500 mt-1 line-clamp-1">{rec.description}</p>
                        </div>
                     </Link>
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
