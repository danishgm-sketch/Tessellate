import React, { useState } from 'react';

export type AccordionSpringVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AccordionSpringProps {
  variant?: AccordionSpringVariant;
}

export function AccordionSpring({ variant = 'quiet' }: AccordionSpringProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const items = [
    { title: 'Which dependencies does this component use?', content: 'This example uses React and CSS transitions. Check your project manifest for its complete dependency list.' },
    { title: 'Do the example colors meet WCAG AA automatically?', content: 'Color pairs depend on the chosen values. Check text, icons, and focus states in the rendered project.' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-3 transition-colors ${cardBg}`}>
      <h4 className="text-sm font-semibold tracking-tight pb-2 border-b border-neutral-100 dark:border-neutral-800">
        Animated Accordion Disclosure
      </h4>

      <div className="space-y-2">
        {items.map((it, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <button
                id={`accordion-trigger-${idx}`}
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${idx}`}
                className="w-full flex items-center justify-between p-3 text-xs font-semibold text-left hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors"
              >
                <span>{it.title}</span>
                <span aria-hidden="true" className={`transform transition-transform duration-200 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              <div
                id={`accordion-panel-${idx}`}
                role="region"
                aria-labelledby={`accordion-trigger-${idx}`}
                aria-hidden={!isOpen}
                className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  <div className="p-3 bg-neutral-50/50 dark:bg-black/30 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {it.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
