import React, { useState } from 'react';

export type AIGenerationCompareVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIGenerationCompareProps {
  variant?: AIGenerationCompareVariant;
}

export function AIGenerationCompare({ variant = 'quiet' }: AIGenerationCompareProps) {
  const [chosen, setChosen] = useState<'A' | 'B' | null>('B');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Candidate Generation Comparison</h4>
          <p className="text-xs text-neutral-500">Pick the best interface composition</p>
        </div>
        <span className="text-xs font-mono text-neutral-400">Prompt: "Executive Dashboard Header"</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Candidate A */}
        <div
          onClick={() => setChosen('A')}
          className={`p-4 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
            chosen === 'A'
              ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800 ring-2 ring-current'
              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold font-mono">Candidate A (Quiet)</span>
              <span className="text-[10px] font-mono text-neutral-400">Latency: 420ms</span>
            </div>
            <p className="text-neutral-500 leading-relaxed">
              Monochrome high-density header with hairline dividers, compact breadcrumbs, and right-aligned metric sparklines.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
            <span className="text-[11px] font-mono text-neutral-400">Cohesion: 92/100</span>
            <button className="px-3 py-1 text-xs rounded bg-neutral-200 dark:bg-neutral-700 font-medium">
              {chosen === 'A' ? '✓ Selected' : 'Select A'}
            </button>
          </div>
        </div>

        {/* Candidate B */}
        <div
          onClick={() => setChosen('B')}
          className={`p-4 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
            chosen === 'B'
              ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800 ring-2 ring-current'
              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold font-mono">Candidate B (Nocturne)</span>
              <span className="text-[10px] font-mono text-neutral-400">Latency: 510ms</span>
            </div>
            <p className="text-neutral-500 leading-relaxed">
              Obsidian backdrop with cyan hairline accents, high-contrast KPI counters, and status pulse indicators.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
            <span className="text-[11px] font-mono text-emerald-500">Cohesion: 98/100</span>
            <button className="px-3 py-1 text-xs rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium">
              {chosen === 'B' ? '✓ Selected' : 'Select B'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
