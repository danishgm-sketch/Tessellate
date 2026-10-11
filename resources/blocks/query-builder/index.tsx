import React from 'react';

export type QueryBuilderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface QueryBuilderProps {
  variant?: QueryBuilderVariant;
}

export function QueryBuilder({ variant = 'quiet' }: QueryBuilderProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Visual Query Builder</h3>
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-[10px]">WHERE</span>
          <span>category == 'sections'</span>
        </div>
        <div className="flex items-center gap-2 pl-6">
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold text-[10px]">AND</span>
          <span>quality &gt;= 90</span>
        </div>
      </div>
    </div>
  );
}
