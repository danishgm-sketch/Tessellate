import React, { useId, useRef, useState } from 'react';

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
  const [navigationOpen, setNavigationOpen] = useState(false);
  const navigationToggleRef = useRef<HTMLButtonElement>(null);
  const navigationId = useId();

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
    <header
      className={`w-full backdrop-blur-md sticky top-0 z-40 transition-colors ${header}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && navigationOpen) {
          event.preventDefault();
          setNavigationOpen(false);
          navigationToggleRef.current?.focus();
        }
      }}
    >
      <div className="max-w-7xl mx-auto p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 @max-md:w-full">
          <div className="font-semibold tracking-tight text-sm flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-current" />
            <span>{brand}</span>
          </div>

          <button
            ref={navigationToggleRef}
            type="button"
            className="hidden @max-md:inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-current/20 px-3 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-controls={navigationId}
            aria-expanded={navigationOpen}
            aria-label={navigationOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setNavigationOpen((open) => !open)}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              {navigationOpen ? (
                <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              )}
            </svg>
            <span>{navigationOpen ? 'Close' : 'Menu'}</span>
          </button>

          <nav
            id={navigationId}
            aria-label="Product screens"
            className={`flex flex-wrap gap-3 text-xs ${orientation === 'vertical' ? '@3xl:flex-col' : ''} ${navigationOpen ? '@max-md:flex @max-md:w-full @max-md:flex-col @max-md:gap-1 @max-md:border-t @max-md:border-current/15 @max-md:pt-3' : '@max-md:hidden'}`}
          >
            {links.map((l) => (
              l.href
                ? <a key={l.label} href={l.href} className={`min-h-11 flex items-center px-3 transition-colors @md:min-h-0 @md:px-0 ${linkStyle}`}>{l.label}</a>
                : <span key={l.label} className={`min-h-11 flex items-center px-3 transition-colors @md:min-h-0 @md:px-0 ${linkStyle}`}>{l.label}</span>
            ))}
          </nav>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
