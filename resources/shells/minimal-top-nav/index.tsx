import React from 'react';

export type MinimalTopNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MinimalTopNavProps {
  variant?: MinimalTopNavVariant;
  brand?: React.ReactNode;
  links?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  orientation?: 'horizontal'|'vertical';
}

export function MinimalTopNav({
  variant = 'quiet',
  brand = 'Example workspace',
  links = [
    { label: 'Overview' },
    { label: 'People' },
    { label: 'Settings' },
  ],
  actions,
  orientation,
}: MinimalTopNavProps) {
  let header = 'bg-white/80 border-b border-neutral-200 text-neutral-900';
  let linkStyle = 'text-[var(--tess-ink-secondary,#62666F)] hover:text-neutral-900';
  if (variant === 'expressive') {
    header = 'bg-white/90 border-b border-[#D9D6CF] text-neutral-900 shadow-2xs';
    linkStyle = 'text-neutral-700 hover:text-[#2547E8] font-medium';
  } else if (variant === 'nocturne') {
    header = 'bg-[#0B0D10]/90 border-b border-[#2E3440] text-white';
    linkStyle = 'text-neutral-400 hover:text-white';
  }

  return (
    <header className={`w-full backdrop-blur-md sticky top-0 z-40 transition-colors ${header}`}>
      <div className="max-w-7xl mx-auto p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="font-semibold tracking-tight text-sm flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-current" />
            <span>{brand}</span>
          </div>
          <nav aria-label="Product screens" className={`flex flex-wrap gap-3 text-xs ${orientation==='vertical' ? '@3xl:flex-col' : ''}`}>
            {links.map((l) => (
              l.href
                ? <a key={l.label} href={l.href} className={`transition-colors ${linkStyle}`}>{l.label}</a>
                : <span key={l.label} className={`transition-colors ${linkStyle}`}>{l.label}</span>
            ))}
          </nav>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
