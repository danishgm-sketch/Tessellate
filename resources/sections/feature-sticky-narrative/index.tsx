import React from 'react';

export type FeatureStickyNarrativeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureStickyNarrativeProps {
  variant?: FeatureStickyNarrativeVariant;
}

export function FeatureStickyNarrative({ variant = 'quiet' }: FeatureStickyNarrativeProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-3 block">Architecture</span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">Designed for longevity and auditability.</h2>
          <p className="text-sm opacity-80 leading-relaxed">
            Every layer of Tessellate is structured so you retain 100% control over output artifacts without proprietary cloud dependencies.
          </p>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {[1, 2, 3].map((num) => (
            <div key={num} className={`p-8 rounded-2xl border ${card}`}>
              <span className="text-xs font-mono font-bold text-neutral-500 mb-2 block">Phase 0{num}</span>
              <h3 className="text-xl font-bold mb-2">Canonical Verification Standard</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                Resources must pass deterministic checks: zero undeclared dependencies, AA accessibility scores, and multi-viewport responsiveness.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
