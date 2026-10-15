import React, { useState } from 'react';

export type FaqAccordionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FaqAccordionProps {
  /** Questions and answers to show. */
  items?: Array<{ q: string; a: string }>;
  variant?: FaqAccordionVariant;
}

export function FaqAccordion({ variant = 'quiet', items }: FaqAccordionProps) {
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

  const faqs = items ?? [
    { q: 'How do I get started?', a: 'Create an account, then follow the short setup steps. Most people are up and running in a few minutes.' },
    { q: 'Can I change or cancel later?', a: 'Yes. You can change your plan or cancel at any time from your account settings.' },
    { q: 'How is my data protected?', a: 'Your data is encrypted in transit and at rest, and only you and the people you invite can see it.' },
    { q: 'How do I get help?', a: 'Contact our support team from the Help page and we will reply by email.' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={f.q} className={`border rounded-xl p-5 transition-all ${itemBorder}`}>
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full text-left font-semibold text-sm sm:text-base flex justify-between items-center"
              >
                <span>{f.q}</span>
                <span className="font-mono text-xs opacity-60">{openIdx === i ? '−' : '+'}</span>
              </button>
              {openIdx === i && (
                <p className="text-xs sm:text-sm opacity-80 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 leading-relaxed">
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
