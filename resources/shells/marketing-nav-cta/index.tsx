import React from 'react';

export type MarketingNavCtaVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MarketingNavCtaProps {
  variant?: MarketingNavCtaVariant;
  links?: Array<{ label: string; href?: string }>;
  onCtaClick?: () => void;
}

export function MarketingNavCta({ variant = 'quiet', links = [{ label: 'Features' }, { label: 'Pricing' }], onCtaClick }: MarketingNavCtaProps) {
  let bar = 'bg-white border-b border-neutral-200 text-neutral-900';
  let cta = 'bg-neutral-900 text-white';
  if (variant === 'expressive') {
    bar = 'bg-white border-b border-[#D9D6CF] text-neutral-900 dark:bg-[#0B0D10] dark:border-[#2E3440] dark:text-white';
    cta = 'bg-[var(--tess-accent-primary,#2547E8)] text-[var(--tess-accent-ink,#FFFFFF)] shadow-xs';
  } else if (variant === 'nocturne') {
    bar = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';
    cta = 'bg-white text-neutral-950 font-semibold';
  }

  return (
    <header className={`w-full px-3 py-3 @sm:px-6 @sm:py-0 min-h-16 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 ${bar}`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="font-semibold text-sm">Tessellate</span>
        <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-[var(--tess-ink-secondary,#62666F)] dark:text-neutral-300 rounded px-1.5 py-0.5 font-mono">
          BETA
        </span>
      </div>
      <div className="flex max-w-full flex-wrap items-center justify-end gap-x-2 gap-y-2 text-xs @sm:gap-x-4">
        {links.map((link) => link.href
          ? <a key={link.label} href={link.href} className="opacity-70 hover:opacity-100">{link.label}</a>
          : <span key={link.label} className="opacity-70">{link.label}</span>)}
        <button type="button" onClick={onCtaClick} disabled={!onCtaClick} aria-describedby={!onCtaClick ? 'marketing-nav-cta-action-help' : undefined} className={`px-3 @sm:px-4 py-1.5 rounded-[var(--tess-radius-lg,8px)] text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${cta}`}>
          Start Free
        </button>
      </div>
      {!onCtaClick && <span id="marketing-nav-cta-action-help" className="sr-only">Connect a start action before enabling this call to action.</span>}
    </header>
  );
}
