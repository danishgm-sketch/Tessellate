import React from 'react';

export type FaqTwoColumnVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FaqTwoColumnProps {
  /** Questions and answers to show. */
  items?: Array<{ q: string; a: string }>;
  variant?: FaqTwoColumnVariant;
}

export function FaqTwoColumn({ variant = 'quiet', items }: FaqTwoColumnProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const faqItems = items ?? [
    { q: 'How do I get started?', a: 'Create an account, then follow the short setup steps. Most people are up and running in a few minutes.' },
    { q: 'Can I change or cancel later?', a: 'Yes. You can change your plan or cancel at any time from your account settings.' },
    { q: 'How is my data protected?', a: 'Your data is encrypted in transit and at rest, and only you and the people you invite can see it.' },
    { q: 'How do I get help?', a: 'Contact our support team from the Help page and we will reply by email.' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Questions & Answers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {faqItems.map((it) => (
            <div key={it.q} className="space-y-2">
              <h3 className="font-semibold text-sm sm:text-base">{it.q}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{it.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
