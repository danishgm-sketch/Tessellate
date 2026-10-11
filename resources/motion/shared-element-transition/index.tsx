import React, { useState } from 'react';

export type SharedElementTransitionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SharedElementTransitionProps {
  variant?: SharedElementTransitionVariant;
}

export function SharedElementTransition({ variant = 'quiet' }: SharedElementTransitionProps) {
  const [expanded, setExpanded] = useState(false);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col items-center justify-center min-h-[260px] transition-colors ${cardBg}`}>
      <div
        onClick={() => setExpanded(!expanded)}
        className={`rounded-xl border border-neutral-300 dark:border-neutral-700 p-5 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:transform-none bg-neutral-50 dark:bg-neutral-900/80 ${
          expanded ? 'w-full max-w-lg shadow-2xl' : 'w-64 shadow-md'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-neutral-400">Card Element</span>
          <span className="text-xs font-mono">{expanded ? 'Expanded' : 'Compact'}</span>
        </div>
        <h4 className="text-sm font-bold tracking-tight mb-1">Design DNA Matrix</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          {expanded
            ? 'Fully expanded view revealing all 27 mathematical design tokens, contrast ratios, and density vectors.'
            : 'Click to morph into expanded detailed view.'}
        </p>
      </div>
    </div>
  );
}
