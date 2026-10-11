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
    { title: 'How does Tessellate preserve 0 paid dependencies?', content: 'All catalog resources use standard React, Tailwind CSS 4, and inline SVG primitives without proprietary external dependencies.' },
    { title: 'Are tokens compatible with WCAG 2.2 AA?', content: 'Yes, all presets enforce mathematically verified contrast ratios across buttons, badges, and body copy.' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-3 transition-colors ${cardBg}`}>
      <h4 className="text-sm font-semibold tracking-tight pb-2 border-b border-neutral-100 dark:border-neutral-800">
        Spring Accordion Disclosure
      </h4>

      <div className="space-y-2">
        {items.map((it, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-3 text-xs font-semibold text-left hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors"
              >
                <span>{it.title}</span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {isOpen && (
                <div className="p-3 bg-neutral-50/50 dark:bg-black/30 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 leading-relaxed">
                  {it.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
