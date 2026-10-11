import React from 'react';

export type TableSkeletonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TableSkeletonProps {
  rows?: number;
  variant?: TableSkeletonVariant;
  children?: React.ReactNode;
}

export function TableSkeleton({ rows = 5, variant = 'quiet', children }: TableSkeletonProps) {
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
      aria-label="Loading table rows"
      className={`p-6 rounded-xl border max-w-4xl mx-auto space-y-4 animate-pulse transition-colors ${containerBg}`}
    >
      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 pb-3 border-b border-neutral-200/20">
        <div className={`h-4 w-24 rounded ${blockBg}`} />
        <div className={`h-4 w-20 rounded ${blockBg}`} />
        <div className={`h-4 w-16 rounded ${blockBg}`} />
        <div className={`h-4 w-12 rounded justify-self-end ${blockBg}`} />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-4 py-2 border-b border-neutral-200/10 items-center">
          <div className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full ${blockBg}`} />
            <div className={`h-4 w-28 rounded ${blockBg}`} />
          </div>
          <div className={`h-4 w-20 rounded ${blockBg}`} />
          <div className={`h-4 w-16 rounded ${blockBg}`} />
          <div className={`h-6 w-14 rounded justify-self-end ${blockBg}`} />
        </div>
      ))}

      {children}
    </div>
  );
}
