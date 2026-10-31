import React from 'react';

export type TestimonialQuoteVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TestimonialQuoteProps {
  variant?: TestimonialQuoteVariant;
  quote?: string;
  authorName?: string;
  authorRole?: string;
  company?: string;
}

export function TestimonialQuote({
  variant = 'quiet',
  quote = 'This illustrative quote demonstrates the layout. Replace it with an approved customer statement before publishing.',
  authorName = 'Example Customer',
  authorRole = 'Example Role',
  company = 'Example Organisation',
}: TestimonialQuoteProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let accent = 'text-neutral-400';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-br from-blue-50/50 via-white to-amber-50/30 text-neutral-950 border-[#D9D6CF]';
    accent = 'text-[#2547E8]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    accent = 'text-cyan-400';
  }

  return (
    <section className={`relative w-full py-24 sm:py-32 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <span className={`text-6xl font-serif leading-none mb-6 ${accent}`}>“</span>
        <blockquote className="text-xl sm:text-3xl font-medium tracking-tight leading-snug mb-10 text-balance">
          {quote}
        </blockquote>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          <div className="text-left">
            <div className="font-semibold text-sm">{authorName}</div>
            <div className="text-xs opacity-75">{authorRole}, {company}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
