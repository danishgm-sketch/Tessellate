import React, { useState } from 'react';

export type HorizontalScrollStoryVariant = 'quiet' | 'expressive' | 'nocturne';

export interface HorizontalScrollStoryProps {
  variant?: HorizontalScrollStoryVariant;
}

export function HorizontalScrollStory({ variant = 'quiet' }: HorizontalScrollStoryProps) {
  const [activeStep, setActiveStep] = useState(0);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const cards = [
    { step: 'Phase 01', title: 'Catalog Discovery', desc: 'Auto-scan verified components in repository.' },
    { step: 'Phase 02', title: 'Constraint Solving', desc: 'Deterministic compatibility checks for tokens.' },
    { step: 'Phase 03', title: 'Standalone Export', desc: 'Pure React output with 0 runtime lock-in.' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Horizontal Build Order</h4>
          <p className="text-xs text-neutral-500">Step {activeStep + 1} of {cards.length}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 disabled:opacity-40"
          >
            ←
          </button>
          <button
            onClick={() => setActiveStep(Math.min(cards.length - 1, activeStep + 1))}
            disabled={activeStep === cards.length - 1}
            className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-hidden py-2">
        {cards.map((c, idx) => {
          const isSelected = activeStep === idx;
          return (
            <div
              key={c.step}
              onClick={() => setActiveStep(idx)}
              className={`flex-shrink-0 w-64 p-4 rounded-xl border text-xs cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800 ring-1 ring-current scale-100'
                  : 'border-neutral-200 dark:border-neutral-800 opacity-60 scale-95'
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-neutral-400 block mb-1">{c.step}</span>
              <div className="font-semibold text-sm mb-1">{c.title}</div>
              <p className="text-neutral-500 leading-relaxed text-[11px]">{c.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
