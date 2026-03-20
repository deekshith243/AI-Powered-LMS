'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Send, Loader2, CheckCircle2, AlertCircle, Timer, User, BrainCircuit, RefreshCw } from 'lucide-react';
import api from '../../../lib/api';

interface Evaluation {
  score: number;
  strengths: string;
  weaknesses: string;
  feedback: string;
}

export default function MockInterview() {
  const [role, setRole] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [error, setError] = useState('');
 
  // Debug log for role
  console.log("Interview Role:", role);
  console.log("Interview Answer:", currentAnswer);

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
    if (!role) {
      alert("Please enter a target role");
      return setError('Please enter a role for the interview.');
    }
    
    setLoading(true);
    setError('');
    
    console.log("--- Starting Mock Interview ---");
    console.log("Target Role:", role);
    console.log("Endpoint: /api/ai/interview/start");

    try {
      const res = await api.post('/ai/interview/start', { role });
      console.log("Interview Questions received:", res.data.questions);
      setQuestions(res.data.questions);
      setAnswers(new Array(res.data.questions.length).fill(''));
      setIsInterviewActive(true);
      setCurrentStep(0);
      setTimeLeft(300);
      setEvaluation(null);
    } catch (err: any) {
      console.error("Interview Start Error:", err);
      setError(err.response?.data?.message || 'Failed to start interview. Try again.');
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
    setEvaluating(true);
    setIsInterviewActive(false);
    
    console.log("--- Evaluating Interview ---");
    console.log("Role:", role);
    console.log("Answers:", answers);
    console.log("Endpoint: /api/ai/interview/evaluate");

    try {
      const res = await api.post('/ai/interview/evaluate', { 
        role, 
        questions, 
        userAnswers: answers 
      });
      console.log("Evaluation Result:", res.data);
      setEvaluation(res.data);
    } catch (err: any) {
      console.error("Evaluation Error:", err);
      setError(err.response?.data?.message || 'Evaluation failed.');
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
      <div className="premium-card p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl animate-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 mb-4 border border-blue-200">
            <span className="text-3xl font-bold">{evaluation.score}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Interview Performance</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4 p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Strengths
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{evaluation.strengths}</p>
          </div>
          <div className="space-y-4 p-5 rounded-xl bg-red-50 border border-red-100">
            <h3 className="text-red-600 font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Areas for Improvement
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{evaluation.weaknesses}</p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 mb-8">
          <h3 className="text-gray-900 font-semibold mb-2">Expert Feedback</h3>
          <p className="text-sm text-gray-600 leading-relaxed italic">{evaluation.feedback}</p>
        </div>

        <button
          onClick={() => { setEvaluation(null); setQuestions([]); setIsInterviewActive(false); }}
          className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Start New Interview
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
            <h2 className="text-xl font-bold text-gray-900 leading-relaxed mb-6">
              {questions[currentStep]}
            </h2>
            <textarea
              value={currentAnswer}
              onChange={(e) => {
                console.log("Typing interview answer:", e.target.value);
                setCurrentAnswer(e.target.value);
              }}
              placeholder="Type your answer here..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-48 transition-all resize-none leading-relaxed"
            />
          </div>

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
              disabled={evaluating}
              className="px-10 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
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
      )}
    </div>
  );
}
