import React from 'react';

export type CtaMinimalVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaMinimalProps {
  variant?: CtaMinimalVariant;
}

export function CtaMinimal({ variant = 'quiet' }: CtaMinimalProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let btn = 'bg-neutral-900 text-white hover:bg-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/40 text-neutral-950 border-[#D9D6CF]';
    btn = 'bg-[#2547E8] text-white hover:bg-[#1B35B4] shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    btn = 'bg-cyan-500 text-black hover:bg-cyan-400 font-medium';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Start composing with Tessellate today.</h2>
        <p className="text-xs sm:text-sm opacity-75 mb-8">No accounts, no credit cards, zero proprietary dependencies.</p>
        <button type="button" className={`px-6 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${btn}`}>
          Open Free Workbench →
        </button>
      </div>
    </section>
  );
}
