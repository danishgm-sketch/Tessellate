import React, { useState } from 'react';

export type FadeUpRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FadeUpRevealProps {
  variant?: FadeUpRevealVariant;
  children?: React.ReactNode;
}

export function FadeUpReveal({ variant = 'quiet', children }: FadeUpRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const transitionClass =
    variant === 'expressive'
      ? 'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]'
      : variant === 'nocturne'
      ? 'transition-all duration-500 ease-out'
      : 'transition-all duration-300 ease-linear';

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setRevealed(false);
            setTimeout(() => setRevealed(true), 50);
          }}
          className="text-xs px-3 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-[var(--tess-ink-muted,#62666F)] hover:text-current"
        >
          Replay Entrance
        </button>
      </div>

      <div
        className={`w-full p-6 rounded-[var(--tess-radius-xl,8px)] border ${cardBg} ${transitionClass} motion-reduce:transition-none motion-reduce:transform-none ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {children ?? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold tracking-tight">Deterministic Fade-Up Reveal</h4>
            <p className="text-xs text-[var(--tess-ink-muted,#62666F)] leading-relaxed">
              Entrance animation triggered with CSS transitions. Respects prefers-reduced-motion to eliminate motion sickness.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
