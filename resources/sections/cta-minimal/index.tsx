import React from 'react';

export type CtaMinimalVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaMinimalProps {
  variant?: CtaMinimalVariant;
  headline?: string;
  description?: string;
  label?: string;
  href?: string;
}

export function CtaMinimal({ variant = 'quiet', headline='Make this interface your own.', description='Example content. Replace it with your product story.', label='Explore resources', href='/explore' }: CtaMinimalProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let btn = 'bg-neutral-900 text-white hover:bg-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/40 text-neutral-950 border-[#D9D6CF]';
    btn = 'bg-[var(--tess-accent-primary,#2547E8)] text-[var(--tess-accent-ink,#FFFFFF)] hover:bg-[#1B35B4] shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    btn = 'bg-[var(--tess-accent-primary,#06B6D4)] text-[var(--tess-accent-ink,#111217)] hover:bg-cyan-400 font-medium';
  }

  return (
    <section className={`relative w-full py-20 px-6 @sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-3xl @sm:text-4xl font-bold tracking-tight mb-4">{headline}</h2>
        <p className="text-xs @sm:text-sm opacity-75 mb-8">{description}</p>
        <a href={href} className={`px-6 py-3 rounded-[var(--tess-radius-lg,8px)] text-xs font-semibold uppercase tracking-wider transition-all ${btn}`}>{label} →</a>
      </div>
    </section>
  );
}
