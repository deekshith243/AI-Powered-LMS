'use client';

import CareerSuite from '@/app/components/career/CareerSuite';
import { Suspense } from 'react';

export default function CareerPathPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Suspense fallback={<div className="animate-pulse bg-gray-100 h-96 rounded-2xl" />}>
        <CareerSuite />
      </Suspense>
    </div>
  );
}
