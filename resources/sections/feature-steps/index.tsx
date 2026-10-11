import React from 'react';

export type FeatureStepsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureStepsProps {
  variant?: FeatureStepsVariant;
}

export function FeatureSteps({ variant = 'quiet' }: FeatureStepsProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/30 border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const steps = [
    { num: '01', title: 'Select Blueprint', desc: 'Choose a battle-tested archetype tailored to your product category.' },
    { num: '02', title: 'Tune Design DNA', desc: 'Adjust typography, density, and curvature with real-time feedback.' },
    { num: '03', title: 'Export Full Code', desc: 'Download standalone TypeScript and Tailwind files with 0 runtime lock-in.' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Three Steps to Production</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className={`p-6 rounded-2xl border ${card}`}>
              <div className="text-3xl font-mono font-bold mb-4 opacity-50">{s.num}</div>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
