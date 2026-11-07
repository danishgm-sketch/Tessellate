import React from 'react';

export type HowItWorksStepsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface HowItWorksStepsProps {
  variant?: HowItWorksStepsVariant;
}

export function HowItWorksSteps({ variant = 'quiet' }: HowItWorksStepsProps) {
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
    { step: '01', title: 'Describe the product', desc: 'Start in Compose with the product brief and constraints.' },
    { step: '02', title: 'Choose and refine', desc: 'Compare interface directions, then edit the selected project in Workbench.' },
    { step: '03', title: 'Export the project', desc: 'Download a React/Vite project to continue in your own repository.' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">How Tessellate Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className={`p-6 rounded-2xl border ${card}`}>
              <span className="text-xs font-mono font-bold text-neutral-500 mb-4 block">STEP {s.step}</span>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
