import React from 'react';

export type CardGridSkeletonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CardGridSkeletonProps {
  count?: number;
  variant?: CardGridSkeletonVariant;
  children?: React.ReactNode;
}

export function CardGridSkeleton({ count = 3, variant = 'quiet', children }: CardGridSkeletonProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const blockBg =
    variant === 'nocturne'
      ? 'bg-neutral-800/60'
      : variant === 'expressive'
      ? 'bg-indigo-100/60'
      : 'bg-neutral-200/80';

  return (
    <div
      role="status"
      aria-label="Loading card grid"
      className={`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto space-y-4 animate-pulse transition-colors ${containerBg}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-neutral-200/20 space-y-3">
            <div className={`h-32 w-full rounded-lg ${blockBg}`} />
            <div className={`h-4 w-3/4 rounded ${blockBg}`} />
            <div className={`h-3 w-full rounded ${blockBg}`} />
            <div className={`h-3 w-2/3 rounded ${blockBg}`} />
            <div className="pt-2 flex justify-between items-center">
              <div className={`h-3 w-16 rounded ${blockBg}`} />
              <div className={`h-6 w-14 rounded-md ${blockBg}`} />
            </div>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
