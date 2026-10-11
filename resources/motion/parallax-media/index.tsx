import React, { useState } from 'react';

export type ParallaxMediaVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ParallaxMediaProps {
  variant?: ParallaxMediaVariant;
}

export function ParallaxMedia({ variant = 'quiet' }: ParallaxMediaProps) {
  const [offset, setOffset] = useState(0);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        setOffset(x * 20);
      }}
      onMouseLeave={() => setOffset(0)}
      className={`w-full p-8 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden h-64 transition-colors ${cardBg}`}
    >
      {/* Background layer (slow speed) */}
      <div
        className="absolute inset-0 bg-neutral-100/50 dark:bg-neutral-900/50 flex items-center justify-center pointer-events-none transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offset * 0.4}px)` }}
      >
        <div className="w-48 h-48 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700" />
      </div>

      {/* Foreground layer (fast speed) */}
      <div
        className="relative z-10 p-5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg text-center transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offset * 1.2}px)` }}
      >
        <div className="text-xs font-mono font-bold uppercase text-neutral-400 mb-1">Multi-Plane Parallax</div>
        <div className="text-sm font-bold">Foreground Reactive Layer</div>
      </div>
    </div>
  );
}
