'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function LearnIndex({ params }: { params: { subjectId: string } }) {
  const router = useRouter();

  useEffect(() => {
    // Navigate to the first uncompleted video
    const fetchTree = async () => {
      try {
        const res = await api.get(`/subjects/${params.subjectId}/tree`);
        let firstVideoId = null;
        let resumeVideoId = null;

        for (const section of res.data) {
          for (const video of section.videos) {
            if (!firstVideoId) firstVideoId = video.id;
            if (!video.completed && !video.isLocked) {
              resumeVideoId = video.id;
              break;
            }
          }
          if (resumeVideoId) break;
        }

        if (resumeVideoId) {
          router.replace(`/learn/${params.subjectId}/${resumeVideoId}`);
        } else if (firstVideoId) {
          router.replace(`/learn/${params.subjectId}/${firstVideoId}`);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchTree();
  }, [params.subjectId, router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-gray-500 animate-pulse">Finding where you left off...</div>
    </div>
  );
}
