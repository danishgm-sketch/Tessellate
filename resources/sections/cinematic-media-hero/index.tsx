import React from 'react';

export type CinematicMediaHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CinematicMediaHeroProps {
  variant?: CinematicMediaHeroVariant;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function CinematicMediaHero({
  variant = 'quiet',
  eyebrow = 'CHAPTER ONE // GENESIS',
  title = 'The Architecture of Absolute Coherence',
  subtitle = 'A unified resource universe where components, layouts, and Design DNA behave as mathematical invariants.',
}: CinematicMediaHeroProps) {
  let glow = 'from-neutral-700/20 via-transparent to-transparent';
  let accent = 'text-neutral-400';

  if (variant === 'expressive') {
    glow = 'from-blue-600/30 via-indigo-900/20 to-transparent';
    accent = 'text-blue-400 font-semibold';
  } else if (variant === 'nocturne') {
    glow = 'from-cyan-500/20 via-blue-950/20 to-transparent';
    accent = 'text-cyan-400 font-mono';
  }

  return (
    <section className="relative w-full py-32 sm:py-44 px-6 sm:px-12 bg-black text-white overflow-hidden border-b border-neutral-800">
      <div className={`absolute inset-0 bg-radial ${glow} pointer-events-none`} />
      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        <span className={`text-xs tracking-[0.25em] mb-8 uppercase ${accent}`}>{eyebrow}</span>
        <h1 className="text-4xl sm:text-7xl font-bold tracking-tighter leading-[1.05] mb-8 text-balance">
          {title}
        </h1>
        <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mb-12 leading-relaxed">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button type="button" className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors">
            Enter Platform
          </button>
          <button type="button" className="px-8 py-3.5 rounded-full border border-neutral-700 text-white font-medium text-sm hover:bg-neutral-900 transition-colors">
            Read Whitepaper
          </button>
        </div>
      </div>
    </section>
  );
}
