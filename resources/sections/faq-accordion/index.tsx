import React, { useState } from 'react';

export type FaqAccordionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FaqAccordionProps {
  variant?: FaqAccordionVariant;
}

export function FaqAccordion({ variant = 'quiet' }: FaqAccordionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let itemBorder = 'border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    itemBorder = 'border-blue-100';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    itemBorder = 'border-[#2E3440]';
  }

  const faqs = [
    { q: 'How is a monthly plan price calculated?', a: 'Example answer: multiply the number of seats by the monthly price per seat. Replace this copy with verified billing rules.' },
    { q: 'Can customers switch plans?', a: 'Example answer: describe when and how customers can change plans under your terms.' },
    { q: 'Is there a free plan?', a: 'Example answer: describe your trial or free plan here, or remove this question if you do not offer one.' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 @sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Example FAQ copy</h2>
        <p className="mx-auto -mt-6 mb-8 max-w-2xl text-center text-sm opacity-75">Example questions and answers only. Replace them with verified product policies.</p>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={f.q} className={`border rounded-[var(--tess-radius-xl,8px)] p-5 transition-all ${itemBorder}`}>
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full text-left font-semibold text-sm @sm:text-base flex justify-between items-center"
              >
                <span>{f.q}</span>
                <span className="font-mono text-xs opacity-60">{openIdx === i ? '−' : '+'}</span>
              </button>
              {openIdx === i && (
                <p className="text-xs @sm:text-sm opacity-80 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 leading-relaxed">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
