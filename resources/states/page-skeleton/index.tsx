import React from 'react';

export type PageSkeletonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PageSkeletonProps {
  variant?: PageSkeletonVariant;
  children?: React.ReactNode;
}

export function PageSkeleton({ variant = 'quiet', children }: PageSkeletonProps) {
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
      aria-label="Loading page content"
      className={`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto space-y-6 animate-pulse transition-colors ${containerBg}`}
    >
      {/* Header bar shimmer */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200/20">
        <div className={`h-6 w-36 rounded ${blockBg}`} />
        <div className="flex gap-2">
          <div className={`h-8 w-20 rounded ${blockBg}`} />
          <div className={`h-8 w-24 rounded ${blockBg}`} />
        </div>
      </div>

      {/* Hero deck shimmer */}
      <div className="space-y-3 max-w-xl">
        <div className={`h-4 w-28 rounded ${blockBg}`} />
        <div className={`h-8 w-full rounded ${blockBg}`} />
        <div className={`h-4 w-4/5 rounded ${blockBg}`} />
      </div>

      {/* Grid content columns shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className={`h-40 rounded-lg ${blockBg}`} />
        <div className={`h-40 rounded-lg ${blockBg}`} />
        <div className={`h-40 rounded-lg ${blockBg}`} />
      </div>

      {children}
    </div>
  );
}
