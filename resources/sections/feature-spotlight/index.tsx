import React from 'react';

export type FeatureSpotlightVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureSpotlightProps {
  variant?: FeatureSpotlightVariant;
}

export function FeatureSpotlight({ variant = 'quiet' }: FeatureSpotlightProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-[#FAF8F5] border-neutral-300';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-2xl';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <div className={`p-8 sm:p-16 rounded-3xl border text-center flex flex-col items-center ${card}`}>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-4">Spotlight Innovation</span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-2xl mb-6">
            Autonomous Graph Solvers for Coherent Front-Ends
          </h2>
          <p className="text-sm sm:text-base opacity-80 max-w-xl leading-relaxed mb-8">
            Unlike static template libraries, Tessellate understands mathematical compatibility between navigation, content blocks, and typography.
          </p>
          <button type="button" className="px-6 py-3 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-xs uppercase tracking-wider hover:opacity-90">
            Read Graph Architecture Paper
          </button>
        </div>
      </div>
    </section>
  );
}
