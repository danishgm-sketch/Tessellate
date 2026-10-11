import React, { useState } from 'react';

export type BlurToSharpRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BlurToSharpRevealProps {
  variant?: BlurToSharpRevealVariant;
}

export function BlurToSharpReveal({ variant = 'quiet' }: BlurToSharpRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  return (
    <div className={`w-full p-8 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Optical Blur-to-Sharp Focus</span>
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

      <div
        className={`p-6 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all duration-700 motion-reduce:transition-none motion-reduce:filter-none ${
          revealed ? 'opacity-100 filter-none' : 'opacity-0 blur-md'
        }`}
      >
        <div className="text-sm font-semibold mb-1">Razor-Sharp Artifact Output</div>
        <p className="text-xs text-neutral-500 leading-relaxed">
          The blur-to-sharp transition provides a cinematic optical settling effect while gracefully degrading under reduced motion preferences.
        </p>
      </div>
    </div>
  );
}
