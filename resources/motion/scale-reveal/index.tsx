import React, { useState } from 'react';

export type ScaleRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ScaleRevealProps {
  variant?: ScaleRevealVariant;
}

export function ScaleReveal({ variant = 'quiet' }: ScaleRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white shadow-xl'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-xl'
      : 'bg-white border-neutral-200 text-neutral-900 shadow-md';

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setRevealed(false);
            setTimeout(() => setRevealed(true), 50);
          }}
          className="text-xs px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-current"
        >
          Replay Pop
        </button>
      </div>

      <div
        className={`w-full p-6 rounded-xl border ${cardBg} transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none motion-reduce:transform-none ${
          revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <h4 className="text-sm font-semibold mb-1">Scale Pop Dialog</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Pops into view using an intentional slight spring overshoot curve, delivering satisfying tactile feedback.
        </p>
      </div>
    </div>
  );
}
