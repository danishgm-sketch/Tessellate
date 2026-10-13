import React from 'react';

export type FaqTwoColumnVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FaqTwoColumnProps {
  variant?: FaqTwoColumnVariant;
}

export function FaqTwoColumn({ variant = 'quiet' }: FaqTwoColumnProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const items = [
    { q: 'How does Design DNA maintain visual coherence?', a: 'Design DNA treats curvature, contrast, and whitespace as numeric dimensions mapped to project tokens.' },
    { q: 'Can I export to other frameworks like Vue or Svelte?', a: 'V1 is canonically targeted to React + TypeScript + Tailwind 4. Additional AST emitters can be added cleanly.' },
    { q: 'What happens if my network goes offline?', a: 'Tessellate operates guest-first in memory with local IndexedDB persistence, running fully offline.' },
    { q: 'How do you prevent breaking updates?', a: 'Every resource is immutable by schema version. Upgrades use verified migration scripts.' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Questions & Answers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {items.map((it) => (
            <div key={it.q} className="space-y-2">
              <h3 className="font-semibold text-sm sm:text-base">{it.q}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{it.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
