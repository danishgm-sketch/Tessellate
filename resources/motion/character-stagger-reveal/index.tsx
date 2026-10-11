import React, { useState } from 'react';

export type CharacterStaggerRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CharacterStaggerRevealProps {
  variant?: CharacterStaggerRevealVariant;
}

export function CharacterStaggerReveal({ variant = 'quiet' }: CharacterStaggerRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const chars = 'TESSELLATE'.split('');

  return (
    <div className={`w-full p-8 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Kinetic Character Cascade</span>
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

      <div className="flex justify-center tracking-[0.3em] font-mono text-3xl font-extrabold py-4">
        {chars.map((c, idx) => (
          <span
            key={idx}
            style={{ transitionDelay: `${idx * 35}ms` }}
            className={`inline-block transition-all duration-400 motion-reduce:transition-none motion-reduce:transform-none ${
              revealed ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-3'
            }`}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
