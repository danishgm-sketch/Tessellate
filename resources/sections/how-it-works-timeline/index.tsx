import React from 'react';

export type HowItWorksTimelineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface HowItWorksTimelineProps {
  variant?: HowItWorksTimelineVariant;
}

export function HowItWorksTimeline({ variant = 'quiet' }: HowItWorksTimelineProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const milestones = [
    { title: 'Project Initialization', desc: 'Run npx @tessellate/cli init in any React + Tailwind codebase.' },
    { title: 'Semantic Normalisation', desc: 'Tessellate maps existing tokens to Design DNA dimensions.' },
    { title: 'Verified Expansion', desc: 'Pull verified blocks and sections as your product scales.' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">The Adoption Journey</h2>
        <div className="space-y-8 border-l-2 border-neutral-200 dark:border-neutral-800 ml-4 sm:ml-8 pl-6 sm:pl-10">
          {milestones.map((m, i) => (
            <div key={m.title} className="relative">
              <span className="absolute -left-[31px] sm:-left-[47px] top-1 h-3.5 w-3.5 rounded-full bg-neutral-900 dark:bg-white" />
              <span className="text-xs font-mono font-bold text-neutral-500 mb-1 block">STAGE 0{i + 1}</span>
              <h3 className="text-lg font-bold mb-1">{m.title}</h3>
              <p className="text-xs sm:text-sm opacity-75">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
