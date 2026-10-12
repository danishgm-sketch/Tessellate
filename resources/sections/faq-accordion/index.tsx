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
    { q: 'Is Tessellate really 100% free and open core?', a: 'Yes. All 324 canonical launch resources, Design DNA tools, and export CLI commands are free under MIT.' },
    { q: 'Can autonomous coding agents use this directly?', a: 'Yes. Tessellate provides OpenAPI schemas, llms.txt, and official MCP server bindings for Cursor, Claude Code, and Antigravity.' },
    { q: 'Do I need to install any proprietary runtime package?', a: 'No. Tessellate exports pure React and Tailwind CSS source code directly into your repository.' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 @sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Frequently Asked Questions</h2>

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
