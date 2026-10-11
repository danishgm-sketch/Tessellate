import React, { useState } from 'react';

export type WordStaggerRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WordStaggerRevealProps {
  variant?: WordStaggerRevealVariant;
}

export function WordStaggerReveal({ variant = 'quiet' }: WordStaggerRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const words = ['Precision', 'design', 'systems', 'engineered', 'for', 'autonomous', 'agents.'];

  return (
    <div className={`w-full p-8 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Word Stagger Sequence</span>
        <button
          onClick={() => {
            setRevealed(false);
            setTimeout(() => setRevealed(true), 50);
          }}
          className="text-xs px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-current"
        >
          Replay
        </button>
      </div>

      <div className="flex flex-wrap gap-x-2 gap-y-1">
        {words.map((w, idx) => (
          <span
            key={idx}
            style={{ transitionDelay: `${idx * 60}ms` }}
            className={`text-xl sm:text-2xl font-bold tracking-tight inline-block transition-all duration-500 motion-reduce:transition-none motion-reduce:transform-none ${
              revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}
