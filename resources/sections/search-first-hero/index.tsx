import React, { useState } from 'react';

export type SearchFirstHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SearchFirstHeroProps {
  variant?: SearchFirstHeroVariant;
  headline?: string;
  placeholder?: string;
  suggestions?: string[];
}

export function SearchFirstHero({
  variant = 'quiet',
  headline = 'Search 324 validated resources and design blueprints.',
  placeholder = 'Search components, shells, DNA tokens, or blueprints...',
  suggestions = ['Editorial Hero', 'Pricing Table', 'Data Grid', 'Nocturne Theme', 'Command Menu'],
}: SearchFirstHeroProps) {
  const [query, setQuery] = useState('');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300 focus-within:border-neutral-900 focus-within:ring-neutral-900';
  let chip = 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-blue-50/40 via-white to-neutral-50 text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200 focus-within:border-[#2547E8] focus-within:ring-[#2547E8] shadow-lg';
    chip = 'bg-blue-50 text-blue-800 hover:bg-blue-100';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921] focus-within:border-cyan-400 focus-within:ring-cyan-400 shadow-xl';
    chip = 'bg-[#151921] text-neutral-300 hover:bg-[#1E2430] border border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-24 sm:py-32 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-8 max-w-2xl">{headline}</h1>

        <div className={`w-full max-w-2xl flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ring-1 ring-transparent ${inputBorder}`}>
          <svg className="w-5 h-5 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label="Search resources"
            className="w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-neutral-400"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            ⌘K
          </kbd>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs">
          <span className="opacity-60">Trending:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className={`px-3 py-1 rounded-full transition-colors ${chip}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
