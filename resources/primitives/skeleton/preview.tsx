import React from 'react';
import { Skeleton } from './index.js';

export function SkeletonPreview() {
  return (
    <div className="p-8 max-w-sm mx-auto space-y-3 bg-[#FAF9F6]">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}
