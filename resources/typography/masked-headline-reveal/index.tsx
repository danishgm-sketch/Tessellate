import React, { useState } from 'react';

export type MaskedHeadlineRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MaskedHeadlineRevealProps {
  line1?: string;
  line2?: string;
  variant?: MaskedHeadlineRevealVariant;
  children?: React.ReactNode;
}

export function MaskedHeadlineReveal({
  line1 = 'Architectural Coherence.',
  line2 = 'Deterministic Execution.',
  variant = 'quiet',
  children,
}: MaskedHeadlineRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const accentClass =
    variant === 'nocturne'
      ? 'text-cyan-400'
      : variant === 'expressive'
      ? 'text-indigo-600'
      : 'text-neutral-400';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-6 transition-colors ${containerBg}`}>
      <div className="space-y-2">
        <div className="overflow-hidden">
          <div
            className={`text-3xl md:text-5xl font-black tracking-tight transform transition-transform duration-700 ease-out ${
              revealed ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            {line1}
          </div>
        </div>
        <div className="overflow-hidden">
          <div
            className={`text-3xl md:text-5xl font-black tracking-tight ${accentClass} transform transition-transform duration-700 delay-150 ease-out ${
              revealed ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            {line2}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={() => {
            setRevealed(false);
            setTimeout(() => setRevealed(true), 200);
          }}
          className="text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-neutral-700 underline"
        >
          Re-trigger Reveal
        </button>
      </div>

      {children}
    </div>
  );
}
