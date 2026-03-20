'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { CheckCircle, ChevronLeft, ChevronRight, Lock, AlertCircle, FileText, BrainCircuit, Edit3, Save } from 'lucide-react';
import Link from 'next/link';
import { Spinner } from '../../../components/ui/Spinner';
import VideoPlayer from '../../../components/VideoPlayer';

interface VideoData {
  id: number;
  title: string;
  youtube_url: string;
  isLocked: boolean;
  completed: boolean;
  section_id: number;
  subject_id: number;
  previous_video_id: number | null;
  next_video_id: number | null;
  locked?: boolean;
  unlock_reason?: string;
}

const getYouTubeID = (url: string) => {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function VideoPage({ params }: { params: { subjectId: string; videoId: string } }) {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);
  const [startPos, setStartPos] = useState(0);
  
  // AI States
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  
  // Note States
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [savedStatus, setSavedStatus] = useState('');

  // Enrollment State
  const [enrolling, setEnrolling] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const fetchVideoAndProgress = async () => {
      try {
        const videoRes = await api.get(`/videos/${params.videoId}`);
        const data = videoRes.data;

        // If paid-locked, show lock UI (don't redirect, don't fetch progress)
        if (data.locked) {
          setVideo(data);
          setLoading(false);
          return;
        }

        // If sequentially locked, show lock UI
        if (data.isLocked) {
          setVideo(data);
          setLoading(false);
          return;
        }

        // Video is accessible — fetch progress
        const progressRes = await api.get(`/progress/videos/${params.videoId}`);
        setVideo(data);
        setStartPos(progressRes.data.last_position_seconds || 0);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load video.');
      } finally {
        setLoading(false);
      }
    };
    fetchVideoAndProgress();
  }, [params.subjectId, params.videoId, router]);

  const handleMarkComplete = async () => {
    if (!video || video.completed) return;
    setMarking(true);
    try {
      await api.post(`/videos/${video.id}/complete`);
      window.location.reload(); 
    } catch (error) {
      console.error(error);
    } finally {
      setMarking(false);
    }
  };

  const generateSummary = async () => {
     if (!video) return;
     setLoadingSummary(true);
     try {
        const res = await api.post('/ai/summary', { title: video.title });
        setSummary(res.data.summary);
     } catch (err) {
        console.error(err);
        setSummary("Failed to generate summary. Please try again later.");
     } finally {
        setLoadingSummary(false);
     }
  };

  const generateQuiz = async () => {
     if (!video) return;
     setLoadingQuiz(true);
     setQuizScore(null);
     setUserAnswers({});
     try {
        const res = await api.post('/ai/quiz', { topic: video.title });
        setQuiz(res.data.quiz);
     } catch (err) {
        console.error(err);
        setQuiz([{ question: "Failed to generate quiz. Please try again later.", options: [], answer: "" }]);
     } finally {
        setLoadingQuiz(false);
     }
  };

  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const handleQuizSubmit = () => {
    let score = 0;
    quiz.forEach((q: any, idx: number) => {
      if (userAnswers[idx] === q.answer) {
        score++;
      }
    });
    setQuizScore(score);
  };

  const saveNote = async () => {
     if (!video) return;
     setSavingNote(true);
     setSavedStatus('');
     try {
        await api.post(`/notes/${video.id}`, { content: noteContent });
        setSavedStatus('Saved!');
        setTimeout(() => setSavedStatus(''), 3000);
     } catch (err) {
        setSavedStatus('Failed to save.');
     } finally {
        setSavingNote(false);
     }
  };

  const handleEnroll = async () => {
    if (!video) return;
    setEnrolling(true);
    try {
      await api.post('/courses/enroll', { subject_id: video.subject_id });
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to process enrollment.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-8">
       <Spinner className="w-10 h-10" />
    </div>
  );
  
  if (error || !video) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Video Unavailable</h2>
      <p className="text-gray-500 mb-6">{error || "The video could not be found."}</p>
    </div>
  );

  const ytId = video.youtube_url ? getYouTubeID(video.youtube_url) : null;
  const isVideoMissing = !video.isLocked && !video.locked && !ytId;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-50 pt-16 md:pt-0">
      <div className="max-w-5xl mx-auto w-full p-4 sm:p-8 md:p-10 space-y-6 flex-1 flex flex-col">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{video.title}</h1>
          <div className="mt-6 aspect-video w-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 relative">
            {video.locked && video.unlock_reason === 'Payment required' ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-900 absolute inset-0">
                <Lock className="w-12 h-12 text-yellow-500 mb-4" />
                <span className="text-xl font-bold text-gray-100 mb-2">🔒 This is a paid course</span>
                <button 
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="px-6 py-3 mt-4 bg-yellow-500 text-gray-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {enrolling ? 'Processing...' : 'Buy Course'}
                </button>
              </div>
            ) : video.isLocked ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-900 absolute inset-0">
                <Lock className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-lg font-medium text-gray-300">This video is currently locked.</span>
              </div>
            ) : isVideoMissing ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-900 absolute inset-0">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <span className="text-lg font-medium text-gray-300">Video unavailable</span>
              </div>
            ) : (
              <VideoPlayer 
                videoId={ytId}
                title={video.title}
                startPos={startPos}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8 mb-10">
          <div className="flex items-center w-full sm:w-auto space-x-4 mb-4 sm:mb-0">
             {video.previous_video_id ? (
               <Link href={`/learn/${params.subjectId}/${video.previous_video_id}`} className="flex-1 sm:flex-none inline-flex justify-center items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:text-indigo-600 transition-all">
                 <ChevronLeft className="w-5 h-5 mr-1" />
                 Previous
               </Link>
             ) : <div className="hidden sm:block w-[112px]"></div>}
             
             {!video.completed ? (
               <button
                 onClick={handleMarkComplete}
                 disabled={marking}
                 className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
               >
                 {marking ? (
                   <span className="flex items-center"><Spinner className="w-4 h-4 mr-2" /> Marking...</span>
                 ) : 'Mark as Complete'}
               </button>
             ) : (
               <div className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2.5 border border-green-200 bg-green-50 text-sm font-semibold rounded-lg text-green-700">
                 <CheckCircle className="w-5 h-5 mr-2" />
                 Completed
               </div>
             )}
          </div>

          <div className="w-full sm:w-auto">
             {video.next_video_id ? (
                <Link
                  href={video.completed ? `/learn/${params.subjectId}/${video.next_video_id}` : '#'}
                  className={`w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 border shadow-sm text-sm font-medium rounded-lg transition-all ${
                    video.completed
                      ? 'border-indigo-600 text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
                      : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                  }`}
                  onClick={(e) => {
                    if (!video.completed) {
                      e.preventDefault();
                      alert("Please complete this video first to unlock the next one.");
                    }
                  }}
                >
                  Next Video
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
             ) : (
                <div className="w-full sm:w-auto inline-flex flex-col justify-center items-center px-5 py-2">
                  <span className="text-sm font-bold text-gray-400">Subject Complete 🎓</span>
                </div>
             )}
          </div>
        </div>

        {/* AI Features & Notes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 pb-12">
            
            {/* Personal Notes Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-50 p-6 flex flex-col h-[400px]">
               <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                     <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <Edit3 className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-900">Personal Notes</h3>
                        <p className="text-xs text-gray-500">Jot down your thoughts</p>
                     </div>
                  </div>
                  <button 
                     onClick={saveNote}
                     disabled={savingNote}
                     className="text-emerald-600 hover:text-emerald-700 p-2 rounded-full hover:bg-emerald-50 transition flex flex-col items-center group"
                  >
                     <Save className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                     {savedStatus && <span className="text-[10px] whitespace-nowrap font-medium">{savedStatus}</span>}
                  </button>
               </div>
               
               <textarea 
                  className="flex-1 w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none placeholder-gray-400"
                  placeholder="Type your notes for this lesson here..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
               ></textarea>
            </div>

            {/* AI Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-indigo-50 p-6 flex flex-col">
               <div className="flex items-center space-x-3 border-b border-gray-100 pb-4 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                     <FileText className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-gray-900">AI Lesson Summary</h3>
                     <p className="text-xs text-gray-500">Get a quick recap of the core concepts</p>
                  </div>
               </div>
               
               <div className="flex-1 text-sm text-gray-700 leading-relaxed overflow-y-auto">
                  {loadingSummary ? (
                     <div className="flex items-center space-x-2 text-indigo-600 font-medium">
                        <Spinner className="w-4 h-4" /> <span>Generating summary...</span>
                     </div>
                  ) : summary ? (
                     <p>{summary}</p>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-6">
                        <p className="text-gray-400">No summary generated yet.</p>
                        <button onClick={generateSummary} className="px-4 py-2 border border-indigo-200 text-indigo-600 rounded-md font-medium hover:bg-indigo-50 transition">
                           Generate AI Summary
                        </button>
                     </div>
                  )}
               </div>
            </div>

            {/* AI Quiz Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-6 flex flex-col">
               <div className="flex items-center space-x-3 border-b border-gray-100 pb-4 mb-4">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                     <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-gray-900">Knowledge Check</h3>
                     <p className="text-xs text-gray-500">Test your understanding with an AI-generated quiz</p>
                  </div>
               </div>
                        <div className="flex-1 overflow-y-auto">
                  {loadingQuiz ? (
                     <div className="flex items-center space-x-2 text-purple-600 font-medium text-sm">
                        <Spinner className="w-4 h-4 text-purple-600" /> <span>Crafting questions...</span>
                     </div>
                  ) : quiz.length > 0 ? (
                     <div className="space-y-6">
                        {quiz.map((q: any, idx: number) => (
                           <div key={idx} className={`bg-gray-50 p-4 rounded-xl border ${quizScore !== null ? (userAnswers[idx] === q.answer ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50') : 'border-gray-100'}`}>
                              <p className="font-semibold text-gray-900 text-sm mb-3">{idx + 1}. {q.question}</p>
                              {q.options && q.options.length > 0 ? (
                                 <div className="space-y-2">
                                    {q.options.map((opt: string, oIdx: number) => (
                                       <label key={oIdx} className="flex items-center space-x-3 text-sm text-gray-700 cursor-pointer p-2 hover:bg-white rounded-md transition">
                                          <input 
                                            type="radio" 
                                            name={`quiz-${idx}`} 
                                            className="text-purple-600 focus:ring-purple-500" 
                                            checked={userAnswers[idx] === oIdx}
                                            onChange={() => quizScore === null && setUserAnswers(prev => ({ ...prev, [idx]: oIdx }))}
                                            disabled={quizScore !== null}
                                          />
                                          <span className={`${quizScore !== null && q.answer === oIdx ? 'text-green-600 font-bold' : ''}`}>
                                            {opt}
                                          </span>
                                       </label>
                                    ))}
                                 </div>
                              ) : null}
                              {quizScore !== null && (
                                <p className="mt-2 text-xs font-medium">
                                  {userAnswers[idx] === q.answer ? (
                                    <span className="text-green-600">Correct!</span>
                                  ) : (
                                    <span className="text-red-600">Wrong. Correct answer: {q.options[q.answer]}</span>
                                  )}
                                </p>
                              )}
                           </div>
                        ))}
                        
                        {quizScore === null ? (
                          <button 
                            onClick={handleQuizSubmit}
                            className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-md"
                          >
                            Submit Quiz
                          </button>
                        ) : (
                          <div className="p-4 bg-white border-2 border-purple-200 rounded-xl text-center">
                            <p className="text-lg font-bold text-purple-600">Score: {quizScore} / {quiz.length}</p>
                            <button 
                              onClick={generateQuiz}
                              className="mt-2 text-sm text-purple-600 hover:underline font-medium"
                            >
                              Retake Quiz
                            </button>
                          </div>
                        )}
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-6">
                        <p className="text-gray-400 text-sm">Create a quick quiz to reinforce learning.</p>
                        <button onClick={generateQuiz} className="px-4 py-2 border border-purple-200 text-purple-600 rounded-md font-medium hover:bg-purple-50 transition text-sm">
                           Generate AI Quiz
                        </button>
                     </div>
                  )}
               </div>
            </div>

        </div>
      </div>
    </div>
  );
}
