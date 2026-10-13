import React from 'react';

export type EditorialHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EditorialHeroProps {
  variant?: EditorialHeroVariant;
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  primaryCta?: { label: string; href?: string; onClick?: () => void };
  secondaryCta?: { label: string; href?: string; onClick?: () => void };
  note?: string;
}

export function EditorialHero({
  variant = 'quiet',
  eyebrow = 'Open interface resources',
  headline = 'Engineered for deliberate craft and structural speed.',
  subheadline = 'Compose resilient interfaces from a unified design vocabulary, then continue in your own React and Tailwind codebase.',
  primaryCta = { label: 'Explore Catalogue' },
  secondaryCta = { label: 'Read Architecture' },
  note = 'Free & open core • No credit card required',
}: EditorialHeroProps) {
  let container = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let eyebrowStyle = 'text-[var(--tess-ink-secondary,#62666F)] bg-neutral-200/60 border-neutral-300';
  let primaryBtn = 'bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-900';
  let secondaryBtn = 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50';
  let noteColor = 'text-[var(--tess-ink-muted,#62666F)]';

  if (variant === 'expressive') {
    container = 'bg-gradient-to-b from-blue-50/40 via-white to-amber-50/20 text-neutral-950 border-[#D9D6CF]';
    eyebrowStyle = 'text-[#2547E8] bg-blue-100/70 border-blue-200 font-semibold';
    primaryBtn = 'bg-[var(--tess-accent-primary,#2547E8)] text-[var(--tess-accent-ink,#FFFFFF)] hover:bg-[#1B35B4] shadow-md hover:shadow-lg focus-visible:ring-[#2547E8]';
    secondaryBtn = 'bg-white text-neutral-900 border-neutral-300 hover:border-neutral-400';
    noteColor = 'text-[var(--tess-ink-secondary,#62666F)]';
  } else if (variant === 'nocturne') {
    container = 'bg-[#0B0D10] text-white border-[#2E3440]';
    eyebrowStyle = 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60';
    primaryBtn = 'bg-[var(--tess-accent-primary,#06B6D4)] text-[var(--tess-accent-ink,#111217)] hover:bg-cyan-400 font-medium focus-visible:ring-cyan-400';
    secondaryBtn = 'bg-[#151921] text-neutral-200 border-[#2E3440] hover:bg-[#1C222E]';
    noteColor = 'text-neutral-400';
  }

  return (
    <section className={`relative w-full py-24 @sm:py-32 px-6 @sm:px-12 border-b transition-colors ${container}`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        {eyebrow && (
          <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs tracking-wide rounded-full border mb-8 transition-colors ${eyebrowStyle}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {eyebrow}
          </span>
        )}
        <h1 className="text-4xl @sm:text-6xl @md:text-7xl font-bold tracking-tight leading-[1.08] max-w-3xl mb-8">
          {headline}
        </h1>
        <p className="text-lg @sm:text-xl text-balance max-w-2xl mb-10 leading-relaxed opacity-85">
          {subheadline}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <a
            href={primaryCta.href ?? '/explore'}
            onClick={event=>{if(primaryCta.onClick){event.preventDefault();primaryCta.onClick();}}}
            className={`px-6 py-3 rounded-[var(--tess-radius-lg,8px)] text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${primaryBtn}`}
          >
            {primaryCta.label}
          </a>
          <a
            href={secondaryCta.href ?? '/docs'}
            onClick={event=>{if(secondaryCta.onClick){event.preventDefault();secondaryCta.onClick();}}}
            className={`px-6 py-3 rounded-[var(--tess-radius-lg,8px)] text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${secondaryBtn}`}
          >
            {secondaryCta.label}
          </a>
        </div>
        {note && <p className={`text-xs ${noteColor}`}>{note}</p>}
      </div>
    </section>
  );
}
