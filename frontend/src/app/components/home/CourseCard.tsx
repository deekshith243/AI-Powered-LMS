'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, BookX, ChevronRight } from 'lucide-react';

interface Subject {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  price?: number;
  is_free?: boolean;
  is_enrolled?: boolean;
}

interface CourseCardProps {
  subject: Subject;
  onEnroll?: (id: number) => void;
  enrollingId?: number | null;
}

export default function CourseCard({ subject, onEnroll, enrollingId }: CourseCardProps) {
  const isEnrolling = enrollingId === subject.id;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full group relative">
      
      {/* Badges */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
        {subject.is_enrolled ? (
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-lg">
            Enrolled
          </span>
        ) : subject.is_free ? (
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-lg">
            Free
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white shadow-lg">
            ₹{subject.price || 0}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div className="aspect-video bg-gray-50 relative overflow-hidden">
        {subject.thumbnail_url ? (
          <img 
            src={subject.thumbnail_url} 
            alt={subject.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
            <BookOpen className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-xs font-bold uppercase tracking-widest">No Thumbnail</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-2">
          {subject.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-6 font-medium leading-relaxed flex-grow">
          {subject.description}
        </p>
        
        <div className="flex gap-3 pt-6 border-t border-gray-50">
          {!subject.is_enrolled && !subject.is_free && onEnroll && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onEnroll(subject.id);
              }}
              disabled={isEnrolling}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isEnrolling ? '...' : 'Buy'}
            </button>
          )}
          
          <Link
            href={`/learn/${subject.id}`}
            className={`${(!subject.is_enrolled && !subject.is_free && onEnroll) ? 'flex-1' : 'w-full'} flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white ${subject.is_enrolled ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-900 hover:bg-gray-800'} transition-all shadow-sm`}
          >
            {subject.is_enrolled ? (
                <>Go to Course <ChevronRight className="w-4 h-4" /></>
            ) : (
                <>View Details <ChevronRight className="w-4 h-4" /></>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
