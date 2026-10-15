import React, { useState } from 'react';

export type FaqSearchableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FaqSearchableProps {
  /** Questions and answers to show. */
  items?: Array<{ q: string; a: string }>;
  variant?: FaqSearchableVariant;
}

export function FaqSearchable({ variant = 'quiet', items }: FaqSearchableProps) {
  const [query, setQuery] = useState('');

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921]';
  }

  const list = items ?? [
    { q: 'How do I get started?', a: 'Create an account, then follow the short setup steps. Most people are up and running in a few minutes.' },
    { q: 'Can I change or cancel later?', a: 'Yes. You can change your plan or cancel at any time from your account settings.' },
    { q: 'How is my data protected?', a: 'Your data is encrypted in transit and at rest, and only you and the people you invite can see it.' },
    { q: 'How do I get help?', a: 'Contact our support team from the Help page and we will reply by email.' },
  ];

  const filtered = list.filter((item) =>
    item.q.toLowerCase().includes(query.toLowerCase()) || item.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Search Help & FAQ</h2>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter questions..."
          className={`w-full p-3 rounded-xl border text-sm mb-8 outline-none ${inputBorder}`}
        />

        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.q} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#151921]">
              <h3 className="font-semibold text-sm mb-1">{item.q}</h3>
              <p className="text-xs opacity-75">{item.a}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-xs opacity-60">No matching questions found.</p>
          )}
        </div>
      </div>
    </section>
  );
}
