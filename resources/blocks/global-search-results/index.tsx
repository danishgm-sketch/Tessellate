import React from 'react';

export type GlobalSearchResultsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface GlobalSearchResultsProps {
  variant?: GlobalSearchResultsVariant;
}

export function GlobalSearchResults({ variant = 'quiet' }: GlobalSearchResultsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const results = [
    { title: 'Button Primitive', cat: 'Primitives', path: 'resources/primitives/button' },
    { title: 'Editorial Hero', cat: 'Sections', path: 'resources/sections/editorial-hero' },
    { title: 'Analytics Shell', cat: 'Shells', path: 'resources/shells/analytics-shell' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Search Results (3 matches)</h3>
      <div className="space-y-2">
        {results.map((r) => (
          <div key={r.title} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
            <div>
              <div className="font-semibold">{r.title}</div>
              <span className="text-[10px] font-mono opacity-50">{r.path}</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
              {r.cat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
