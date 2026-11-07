import React from 'react';

export type LogoCloudMinimalVariant = 'quiet' | 'expressive' | 'nocturne';

export interface LogoCloudMinimalProps {
  variant?: LogoCloudMinimalVariant;
  title?: string;
  logos?: string[];
}

export function LogoCloudMinimal({
  variant = 'quiet',
  title = 'Illustrative logos · replace with approved marks before publishing',
  logos = ['Example customer', 'Example partner', 'Example team'],
}: LogoCloudMinimalProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let titleColor = 'text-[var(--tess-ink-muted,#62666F)]';
  let logoColor = 'text-[var(--tess-ink-secondary,#62666F)] hover:text-neutral-900';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50 text-neutral-950 border-[#D9D6CF] dark:bg-[#0B0D10] dark:text-white dark:border-[#2E3440]';
    titleColor = 'text-[var(--tess-ink-secondary,#62666F)] font-semibold dark:text-neutral-300';
    logoColor = 'text-neutral-700 hover:text-[#2547E8] dark:text-neutral-300 dark:hover:text-white';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    titleColor = 'text-neutral-400 font-mono';
    logoColor = 'text-neutral-400 hover:text-white';
  }

  return (
    <section className={`relative w-full py-16 px-6 @sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto text-center">
        <p className={`text-xs uppercase tracking-widest mb-10 ${titleColor}`}>{title}</p>
        <div className="flex flex-wrap items-center justify-center gap-10 @sm:gap-16">
          {logos.map((logo) => (
            <span key={logo} className={`font-mono text-sm @sm:text-base font-semibold tracking-wider transition-colors ${logoColor}`}>
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
