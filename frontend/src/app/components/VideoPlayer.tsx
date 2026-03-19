'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  startPos?: number;
}

export default function VideoPlayer({ videoId, title = "YouTube video", startPos = 0 }: VideoPlayerProps) {
  const [play, setPlay] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const fallbackThumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;

  return (
    <div className="relative w-full h-full bg-gray-900 group cursor-pointer overflow-hidden rounded-2xl">
      {play ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&start=${startPos}&rel=0&modestbranding=1`}
          className="w-full h-full absolute top-0 left-0 border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={title}
          allowFullScreen
        />
      ) : (
        <div 
          className="w-full h-full relative"
          onClick={() => setPlay(true)}
        >
          <img
            src={thumbnailUrl}
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackThumbnailUrl;
            }}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl group-hover:bg-indigo-500 group-hover:scale-110 transition-all duration-300">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-current ml-1" />
            </div>
          </div>
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
             <h3 className="text-white font-bold text-lg sm:text-xl line-clamp-1">{title}</h3>
          </div>
        </div>
      )}
    </div>
  );
}
