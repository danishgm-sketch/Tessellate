import React, { useState } from 'react';

export type HowItWorksInteractiveVariant = 'quiet' | 'expressive' | 'nocturne';

export interface HowItWorksInteractiveProps {
  variant?: HowItWorksInteractiveVariant;
}

export function HowItWorksInteractive({ variant = 'quiet' }: HowItWorksInteractiveProps) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: '1. Select Foundation', content: 'Choose from 36 application shells or 72 marketing sections validated against schema version 1.0.0.' },
    { title: '2. Enforce Invariants', content: 'Design DNA applies curvature and spacing rules across all nested children deterministically.' },
    { title: '3. Download Pure Code', content: 'Get pure TypeScript files with 0 external black-box library wrappers.' },
  ];

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/30 border-blue-100 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const currentStep = steps[activeStep] || steps[0] || { title: '', content: '' };

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Step Through the Architecture</h2>

        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setActiveStep(i)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeStep === i ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-200 dark:bg-neutral-800'
              }`}
            >
              Step {i + 1}
            </button>
          ))}
        </div>

        <div className={`w-full p-8 rounded-2xl border text-center max-w-xl transition-all ${card}`}>
          <h3 className="text-xl font-bold mb-3">{currentStep.title}</h3>
          <p className="text-xs sm:text-sm opacity-80 leading-relaxed">{currentStep.content}</p>
        </div>
      </div>
    </section>
  );
}
