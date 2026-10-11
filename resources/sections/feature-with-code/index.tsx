import React from 'react';

export type FeatureWithCodeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureWithCodeProps {
  variant?: FeatureWithCodeVariant;
}

export function FeatureWithCode({ variant = 'quiet' }: FeatureWithCodeProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let term = 'bg-[#18181B] text-white border-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    term = 'bg-[#0E1528] text-blue-100 border-blue-900/50 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    term = 'bg-[#12161F] text-cyan-50 border-[#2E3440] shadow-2xl';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-3 block">TypeScript Native</span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Type-safe manifest composition.</h2>
          <p className="text-sm opacity-80 leading-relaxed mb-6">
            Construct and validate complex page topologies in pure TypeScript with complete autocomplete and compile-time schema checking.
          </p>
        </div>

        <div className={`p-6 rounded-2xl border font-mono text-xs overflow-x-auto shadow-md ${term}`}>
          <div className="text-neutral-500 pb-2 mb-2 border-b border-white/10 text-[11px]">composition.ts</div>
          <pre className="text-emerald-400">
            {`import { composeProject } from '@tessellate/engine';

const project = composeProject({
  theme: 'nocturne',
  sections: [
    'editorial-hero',
    'pricing-three-tier'
  ],
});`}
          </pre>
        </div>
      </div>
    </section>
  );
}
