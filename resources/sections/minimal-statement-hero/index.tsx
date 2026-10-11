import React from 'react';

export type MinimalStatementHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MinimalStatementHeroProps {
  variant?: MinimalStatementHeroVariant;
  statement?: string;
  author?: string;
}

export function MinimalStatementHero({
  variant = 'quiet',
  statement = 'Software is not a collection of parts. It is a single coherent gesture.',
  author = 'The Tessellate Principles',
}: MinimalStatementHeroProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-950 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-32 sm:py-48 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto">
        <blockquote className="text-3xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-8">
          "{statement}"
        </blockquote>
        <cite className="text-sm sm:text-base font-mono not-italic opacity-60">
          — {author}
        </cite>
      </div>
    </section>
  );
}
