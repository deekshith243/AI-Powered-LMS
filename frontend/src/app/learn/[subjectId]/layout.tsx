'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle, Lock, PlayCircle, Menu, X, AlertCircle } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';
import { AITutor } from '../../components/AITutor';

interface Video {
  id: number;
  title: string;
  isLocked: boolean;
  completed: boolean;
}

interface Section {
  id: number;
  title: string;
  videos: Video[];
}

interface SubjectProgress {
  percent_complete: number;
}

export default function LearnLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { subjectId: string };
}) {
  const [sections, setSections] = useState<Section[]>([]);
  const [subjectTitle, setSubjectTitle] = useState('');
  const [progress, setProgress] = useState<SubjectProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectRes, treeRes, progressRes] = await Promise.all([
          api.get(`/subjects/${params.subjectId}`),
          api.get(`/subjects/${params.subjectId}/tree`),
          api.get(`/progress/subjects/${params.subjectId}`)
        ]);
        setSubjectTitle(subjectRes.data.title);
        setSections(treeRes.data);
        setProgress({ percent_complete: progressRes.data.percent_complete });
      } catch (err: any) {
        setError("Failed to load course materials.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.subjectId]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
        <div className="hidden md:flex flex-col w-80 bg-white border-r border-gray-200 p-4">
          <Skeleton className="h-6 w-3/4 mb-6" />
          <Skeleton className="h-4 w-full mb-8" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-8" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-10 w-full mb-2" />
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-1/2 mb-6" />
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || sections.length === 0) {
    return (
       <div className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center p-6 bg-gray-50">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Curriculum Unavailable</h2>
          <p className="text-gray-500 mb-6">{error || "This subject has no content yet."}</p>
          <Link href="/subjects" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Return to Catalog</Link>
       </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)] relative">
      
      {/* Mobile Sidebar Toggle Area */}
      <div className="md:hidden absolute top-4 left-4 z-40">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-white rounded-md shadow-md text-gray-600 hover:text-indigo-600 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 mt-16' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">{subjectTitle}</h2>
            {progress !== null && (
              <div className="mt-4">
                <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                  <span>Course Progress</span>
                  <span className="text-indigo-600">{progress.percent_complete}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${progress.percent_complete}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <button className="md:hidden text-gray-400 hover:text-gray-600" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          {sections.map((section) => (
            <div key={section.id}>
              <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3 pl-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.videos.map((video) => {
                  const isActive = pathname.includes(`/learn/${params.subjectId}/${video.id}`);
                  return (
                    <li key={video.id}>
                      {video.isLocked ? (
                        <div className="flex items-center px-3 py-2.5 text-sm text-gray-400 rounded-lg cursor-not-allowed bg-transparent">
                          <Lock className="w-4 h-4 mr-3 flex-shrink-0 opacity-50" />
                          <span className="truncate">{video.title}</span>
                        </div>
                      ) : (
                        <Link
                          href={`/learn/${params.subjectId}/${video.id}`}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm border border-indigo-100'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {video.completed ? (
                            <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0 text-green-500" />
                          ) : (
                            <PlayCircle className={`w-4 h-4 mr-3 flex-shrink-0 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-400'}`} />
                          )}
                          <span className="truncate">{video.title}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col w-full relative">
        {children}
      </div>

      {/* AI Tutor Floating Widget */}
      <AITutor subjectTitle={subjectTitle} />
    </div>
  );
}
