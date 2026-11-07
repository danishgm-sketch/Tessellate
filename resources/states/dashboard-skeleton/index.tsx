import React from 'react';

export type DashboardSkeletonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DashboardSkeletonProps {
  variant?: DashboardSkeletonVariant;
  children?: React.ReactNode;
}

export function DashboardSkeleton({ variant = 'quiet', children }: DashboardSkeletonProps) {
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
      aria-label="Loading dashboard metrics"
      className={`p-6 @md:p-8 rounded-[var(--tess-radius-xl,8px)] border max-w-4xl mx-auto space-y-6 animate-pulse transition-colors ${containerBg}`}
    >
      {/* 4 Metric cards */}
      <div className="grid grid-cols-2 @md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-[var(--tess-radius-lg,8px)] border border-neutral-200/20 space-y-2">
            <div className={`h-3 w-16 rounded ${blockBg}`} />
            <div className={`h-7 w-24 rounded ${blockBg}`} />
            <div className={`h-3 w-12 rounded ${blockBg}`} />
          </div>
        ))}
      </div>

      {/* Main chart placeholder */}
      <div className="p-6 rounded-[var(--tess-radius-lg,8px)] border border-neutral-200/20 space-y-4">
        <div className="flex justify-between items-center">
          <div className={`h-5 w-40 rounded ${blockBg}`} />
          <div className={`h-6 w-28 rounded ${blockBg}`} />
        </div>
        <div className={`h-48 w-full rounded ${blockBg}`} />
      </div>

      {children}
    </div>
  );
}
