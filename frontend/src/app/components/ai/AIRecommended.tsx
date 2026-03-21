'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight } from 'lucide-react';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { Skeleton } from '../ui/Skeleton';

export default function AIRecommended() {
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/ai/recommendations/${user.id}`);
        setRecommendations(res.data.recommendations);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (!user) {
    return (
      <div className="mt-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-10 text-center shadow-sm">
        <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Personalized Learning</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Sign in to see courses recommended by our AI based on your learning history and goals.
        </p>
        <Link 
          href="/login" 
          className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-16 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-8 shadow-sm premium-card animate-fade-in relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-purple-200/20 rounded-full blur-3xl"></div>

         <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center relative z-10">
            <Sparkles className="w-6 h-6 mr-3 text-indigo-600" />
            AI Recommended For You
         </h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {recommendations.map(rec => (
               <Link href={`/learn/${rec.id}`} key={rec.id}>
                  <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-5 hover:shadow-md transition group h-full flex flex-col justify-center">
                     <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{rec.title}</h4>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                     </div>
                     <p className="text-xs text-gray-500 mt-1 line-clamp-1">{rec.description}</p>
                  </div>
               </Link>
            ))}
         </div>
    </div>
  );
}
