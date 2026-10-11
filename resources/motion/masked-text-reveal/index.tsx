import React, { useState } from 'react';

export type MaskedTextRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MaskedTextRevealProps {
  variant?: MaskedTextRevealVariant;
  text?: string;
}

export function MaskedTextReveal({
  variant = 'quiet',
  text = 'Software Composed, Not Stitched.',
}: MaskedTextRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const textColor =
    variant === 'nocturne'
      ? 'text-white'
      : variant === 'expressive'
      ? 'text-[#2547E8]'
      : 'text-neutral-900 dark:text-white';

  return (
    <div className={`w-full p-8 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Masked Overflow Clip</span>
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

      <div className="overflow-hidden py-1">
        <h2
          className={`text-2xl sm:text-3xl font-bold tracking-tight transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:transform-none ${textColor} ${
            revealed ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {text}
        </h2>
      </div>
    </div>
  );
}
