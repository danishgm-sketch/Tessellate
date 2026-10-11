import React from 'react';

export type FeatureTimelineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureTimelineProps {
  variant?: FeatureTimelineVariant;
}

export function FeatureTimeline({ variant = 'quiet' }: FeatureTimelineProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const milestones = [
    { phase: 'Phase 01', title: 'Schemas & Contract Stabilization', desc: 'Authored canonical Zod models for DNA, Resources, and Projects.' },
    { phase: 'Phase 02', title: 'Composition Engine & Validation', desc: 'Sub-millisecond graph solver enforcing geometric consistency.' },
    { phase: 'Phase 03', title: '324 Canonical Launch Resources', desc: 'Complete coverage across primitives, shells, sections, and blocks.' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Architectural Evolution</h2>

        <div className="space-y-10 border-l-2 border-neutral-200 dark:border-neutral-800 ml-4 sm:ml-8 pl-6 sm:pl-10">
          {milestones.map((m) => (
            <div key={m.phase} className="relative">
              <span className="absolute -left-[31px] sm:-left-[47px] top-1 h-3.5 w-3.5 rounded-full bg-neutral-900 dark:bg-white border-2 border-white dark:border-[#0B0D10]" />
              <span className="text-xs font-mono font-bold text-neutral-500 mb-1 block uppercase">{m.phase}</span>
              <h3 className="text-lg font-bold mb-1">{m.title}</h3>
              <p className="text-xs sm:text-sm opacity-75">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
