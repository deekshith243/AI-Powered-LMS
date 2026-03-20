'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import api from '../../lib/api';
import { Spinner } from './ui/Spinner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AITutor({ subjectTitle }: { subjectTitle: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi! I'm your AI Tutor for **${subjectTitle}**. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
     if (typeof window !== 'undefined') {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
           recognitionRef.current = new SpeechRecognition();
           recognitionRef.current.continuous = false;
           recognitionRef.current.interimResults = false;
           recognitionRef.current.lang = 'en-US';

           recognitionRef.current.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              setInput(transcript);
              handleSend(transcript); // auto-send
           };

           recognitionRef.current.onerror = (event: any) => {
              console.error("Speech recognition error", event.error);
              setIsListening(false);
           };

           recognitionRef.current.onend = () => {
              setIsListening(false);
           };
        }
     }
  }, []);

  const toggleListen = () => {
     if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
     } else {
        recognitionRef.current?.start();
        setIsListening(true);
     }
  };

  const speak = (text: string) => {
     if (!voiceEnabled || !window.speechSynthesis) return;
     // Cancel previous
     window.speechSynthesis.cancel();
     const utterance = new SpeechSynthesisUtterance(text);
     utterance.rate = 1.0;
     utterance.pitch = 1.0;
     window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (overrideInput?: string) => {
    const userMsg = overrideInput || input.trim();
    if (!userMsg || loading) return;
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    if (!overrideInput) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/tutor', { message: userMsg, courseTitle: subjectTitle });
      const answer = res.data.reply || res.data.answer;
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      speak(answer); // Read aloud
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my brain right now. Try again later!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 z-50 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          aria-label="Open AI Tutor"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center shadow-sm">
             <div className="flex items-center space-x-2">
               <Bot className="w-5 h-5" />
               <h3 className="font-semibold text-sm">AI Tutor - {subjectTitle}</h3>
             </div>
             <div className="flex items-center space-x-3">
                <button 
                  onClick={() => {
                     setVoiceEnabled(!voiceEnabled);
                     window.speechSynthesis?.cancel();
                  }} 
                  className="text-indigo-200 hover:text-white transition focus:outline-none flex items-center"
                  title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 focus:outline-none">
                  <X className="w-5 h-5" />
                </button>
             </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
             {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                     msg.role === 'user' 
                       ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' 
                       : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                   }`}>
                      {msg.content}
                   </div>
                </div>
             ))}
             {loading && (
                <div className="flex justify-start">
                   <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm text-gray-500 text-sm flex items-center space-x-2">
                      <Spinner className="w-4 h-4 text-indigo-500" />
                      <span>Thinking...</span>
                   </div>
                </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex flex-col items-center">
             {isListening && <p className="text-xs text-indigo-600 animate-pulse mb-2">Listening...</p>}
             <div className="flex items-center w-full bg-gray-50 border border-gray-200 rounded-full pl-4 pr-1 py-1 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 py-2"
                  disabled={loading || isListening}
                />
                
                <button
                  onClick={toggleListen}
                  disabled={loading}
                  className={`p-2 rounded-full mx-1 transition-colors ${isListening ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-200 hover:text-indigo-600'}`}
                  title="Voice Input"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="p-2 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
