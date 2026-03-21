'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Send, Loader2, CheckCircle2, AlertCircle, Timer, User, BrainCircuit, RefreshCw, Sparkles } from 'lucide-react';

import api from '../../../lib/api';

export default function MockInterview() {
  const [role, setRole] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        (window as any).startSpeech = (onResult: (text: string) => void) => {
          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((result: any) => (result as any)[0])
              .map((result: any) => result.transcript)
              .join('');
            if ((event.results[0] as any).isFinal) {
              onResult(transcript);
            }
          };
          recognition.start();
          setIsRecording(true);
        };

        (window as any).stopSpeech = () => {
          recognition.stop();
          setIsRecording(false);
        };
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInterviewActive && timeLeft > 0 && !evaluation) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isInterviewActive) {
      handleFinish();
    }
    return () => clearInterval(timer);
  }, [isInterviewActive, timeLeft, evaluation]);

  const handleStart = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!role) return setError("Please enter a target role");
    
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/ai/interview/start', { role });
      setQuestions(res.data.questions);
      setAnswers(new Array(res.data.questions.length).fill(''));
      setIsInterviewActive(true);
      setCurrentStep(0);
      setTimeLeft(300);
      setEvaluation(null);
    } catch (err: any) {
      console.error("Interview Start Error:", err);
      setError('Failed to start interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentStep] = currentAnswer;
    setAnswers(updatedAnswers);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentAnswer(answers[currentStep + 1] || '');
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    // PART 1: Validation
    const hasAnswers = answers.some(ans => ans && ans.trim().length > 0) || (currentAnswer && currentAnswer.trim().length > 0);
    
    if (!hasAnswers) {
      setError("Please answer at least one question before finishing the interview.");
      return;
    }

    setEvaluating(true);
    setIsInterviewActive(false);
    setError('');
    
    try {
      // Ensure the last answer is included
      const finalAnswers = [...answers];
      if (currentAnswer) finalAnswers[currentStep] = currentAnswer;

      const res = await api.post('/ai/interview/evaluate', { 
        role, 
        questions, 
        userAnswers: finalAnswers 
      });
      setEvaluation(res.data);
    } catch (err: any) {
      console.error("Evaluation Error:", err);
      setError('Evaluation failed.');
      setIsInterviewActive(true); // Allow them to try again
    } finally {
      setEvaluating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (evaluation) {
    return (
      <div className="premium-card p-8 rounded-2xl bg-white border border-gray-100 shadow-xl animate-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 mb-4 border-4 border-white shadow-lg">
            <span className="text-4xl font-black">{evaluation.score}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Interview Performance</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">{role}</p>
        </div>

        <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
               <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Overall Feedback
               </h3>
               <p className="text-sm text-indigo-800 leading-relaxed italic">{evaluation.feedback || evaluation.overall_feedback}</p>
            </div>

            {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                   <h3 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Growth Suggestions
                   </h3>
                   <ul className="space-y-2">
                      {evaluation.suggestions.map((s: string, i: number) => (
                        <li key={i} className="text-xs text-emerald-800 flex items-start gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                           {s}
                        </li>
                      ))}
                   </ul>
                </div>
            )}
        </div>

        <button
          onClick={() => { setEvaluation(null); setQuestions([]); setIsInterviewActive(false); setRole(''); }}
          className="w-full mt-8 py-4 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Retake Interview
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isInterviewActive ? (
        <div className="premium-card p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-blue-400" />
            AI Mock Interview
          </h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Practice technical and behavioral interviews with our AI expert. Get ready for real-world scenarios in just 5 minutes.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Target Role</label>
              <input
                type="text"
                placeholder="e.g. Frontend Developer, Data Analyst..."
                value={role}
                onChange={(e) => {
                  console.log("Typing interview role:", e.target.value);
                  setRole(e.target.value);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            {error && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {error}</p>}
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(37,99,235,0.2)]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
              Start Technical Interview
            </button>
          </form>
        </div>
      ) : (
        <div className="premium-card p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold">Question {currentStep + 1} of {questions.length}</h3>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{role}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
              <Timer className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 leading-relaxed">
                {questions[currentStep]}
              </h2>
              <button
                onClick={() => {
                  if (isRecording) {
                    (window as any).stopSpeech();
                  } else {
                    (window as any).startSpeech((text: string) => {
                      setCurrentAnswer(prev => prev + " " + text);
                    });
                  }
                }}
                className={`p-3 rounded-xl border transition-all flex items-center gap-2 font-bold text-sm ${
                  isRecording 
                    ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Mic className={`w-4 h-4 ${isRecording ? 'fill-white' : ''}`} />
                {isRecording ? 'Stop Recording' : 'Speak Answer'}
              </button>
            </div>
            <textarea
              value={currentAnswer}
              onChange={(e) => {
                console.log("Typing interview answer:", e.target.value);
                setCurrentAnswer(e.target.value);
              }}
              placeholder="Type or speak your answer here..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-48 transition-all resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-4">
            {error && (
              <p className="text-red-500 text-xs font-bold flex items-center gap-2 bg-red-50 p-3 rounded-xl border border-red-100 animate-pulse">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}
            <div className="flex justify-between items-center">
                <button
                onClick={() => {
                    if (currentStep > 0) {
                    const updatedAnswers = [...answers];
                    updatedAnswers[currentStep] = currentAnswer;
                    setAnswers(updatedAnswers);
                    setCurrentStep(currentStep - 1);
                    setCurrentAnswer(answers[currentStep - 1]);
                    }
                }}
                disabled={currentStep === 0}
                className="px-6 py-2 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition-all font-medium"
                >
                Previous
                </button>
                <button
                onClick={handleNext}
                disabled={evaluating || (currentStep === questions.length - 1 && !currentAnswer && !answers.some(a => a && a.trim()))}
                className="px-10 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {evaluating ? (
                    <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Evaluating Answers...
                    </>
                ) : (
                    <>
                    {currentStep === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
                    <Send className="w-4 h-4 ml-1" />
                    </>
                )}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
