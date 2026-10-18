import React, { useState } from 'react';

export type FadeUpRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FadeUpRevealProps {
  variant?: FadeUpRevealVariant;
  children?: React.ReactNode;
}

export function FadeUpReveal({ variant = 'quiet', children }: FadeUpRevealProps) {
  const [revealed, setRevealed] = useState(true);
  const [motionStatus, setMotionStatus] = useState('');
  const transitionDuration = variant === 'expressive' ? 700 : variant === 'nocturne' ? 500 : 300;
  const previewBg = variant === 'nocturne' ? 'bg-[#0B0D10] text-white' : 'bg-[#FAF9F6] text-neutral-900';

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
    <div className={`w-full flex flex-col gap-4 ${previewBg}`}>
      <div className="flex justify-end">
        <button
          onClick={() => {
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
              || document.documentElement.dataset.tessellateReducedMotion === 'true';
            if (reducedMotion) {
              setMotionStatus('Entrance animation skipped because reduced motion is enabled.');
              return;
            }
            setMotionStatus('');
            setRevealed(false);
            // Let the exit transition finish before replaying the entrance. A
            // 50 ms reset reversed the transition before it became visible.
            setTimeout(() => setRevealed(true), transitionDuration + 120);
          }}
          className="text-xs px-3 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-[var(--tess-ink-muted,#62666F)] hover:text-current"
        >
          Replay Entrance
        </button>
      </div>
      {motionStatus && <p role="status" className="text-xs text-[var(--tess-ink-muted,#62666F)]">{motionStatus}</p>}

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
