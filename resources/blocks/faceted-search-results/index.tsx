import React from 'react';

export type FacetedSearchResultsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FacetedSearchResultsProps {
  variant?: FacetedSearchResultsVariant;
}

export function FacetedSearchResults({ variant = 'quiet' }: FacetedSearchResultsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const facets = ['All (324)', 'Primitives (44)', 'Shells (36)', 'Sections (72)', 'Blocks (56)'];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 border-r border-neutral-200 dark:border-neutral-800 pr-4">
          <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-3 block">Filter Facets</span>
          <div className="space-y-2 text-xs">
            {facets.map((f, i) => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked={i === 0} />
                <span>{f}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="md:col-span-3">
          <span className="text-xs font-semibold mb-3 block">Matching Items</span>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex justify-between">
              <span className="font-semibold">editorial-hero</span>
              <span className="font-mono text-emerald-600">verified</span>
            </div>
            <div className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex justify-between">
              <span className="font-semibold">button</span>
              <span className="font-mono text-emerald-600">verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
