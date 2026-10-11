import React from 'react';

export type ProductScreenshotHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProductScreenshotHeroProps {
  variant?: ProductScreenshotHeroVariant;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
}

export function ProductScreenshotHero({
  variant = 'quiet',
  headline = 'The interface workbench for discerning product teams.',
  subheadline = 'Inspect Design DNA, mutate token systems in real time, and export directly to clean React and Tailwind code.',
  ctaText = 'Start Building Free',
}: ProductScreenshotHeroProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let frame = 'bg-neutral-50 border-neutral-300 shadow-xl';
  let chrome = 'bg-neutral-100 border-b border-neutral-200 text-neutral-500';
  let btn = 'bg-neutral-900 text-white hover:bg-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-blue-50/50 via-white to-neutral-50 text-neutral-950 border-[#D9D6CF]';
    frame = 'bg-white border-blue-200/80 shadow-2xl ring-1 ring-blue-500/10';
    chrome = 'bg-blue-50/60 border-b border-blue-100 text-blue-900';
    btn = 'bg-[#2547E8] text-white hover:bg-[#1B35B4] shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    frame = 'bg-[#151921] border-[#2E3440] shadow-2xl shadow-cyan-950/20';
    chrome = 'bg-[#0E1217] border-b border-[#2E3440] text-neutral-400';
    btn = 'bg-cyan-500 text-black hover:bg-cyan-400 font-medium';
  }

  return (
    <section className={`relative w-full pt-20 pb-28 px-6 sm:px-12 border-b overflow-hidden transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto text-center flex flex-col items-center mb-16">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl mb-6">
          {headline}
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mb-8 leading-relaxed">
          {subheadline}
        </p>
        <button
          type="button"
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${btn}`}
        >
          {ctaText}
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className={`rounded-xl border overflow-hidden transition-all ${frame}`}>
          <div className={`px-4 py-3 flex items-center justify-between text-xs ${chrome}`}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <span className="font-mono text-[11px] opacity-80">https://workbench.tessellate.design</span>
            <div className="w-10" />
          </div>
          <div className="p-8 sm:p-12 min-h-[320px] flex flex-col justify-center items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-current opacity-10 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wide">Interactive Canvas & Manifest Tree</span>
            <span className="text-xs opacity-70 max-w-md">324 validated resources loaded into memory. Real-time token synchronization active.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
