import React, { useId, useState } from 'react';

export type MinimalTopNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TopNavLink {
  label: string;
  href: string;
}

export interface MinimalTopNavProps {
  /** Product name or logo text. */
  brand?: string;
  brandHref?: string;
  /** Primary links. */
  items?: TopNavLink[];
  /** Call to action on the right, e.g. "Book now". */
  actionLabel?: string;
  actionHref?: string;
  variant?: MinimalTopNavVariant;
}

const SAMPLE: TopNavLink[] = [
  { label: 'Services', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

/** Site header with brand, links and a call to action; collapses to a disclosure menu on small screens. */
export function MinimalTopNav({ brand = 'Your product', brandHref = '/', items, actionLabel = 'Get started', actionHref = '#', variant = 'quiet' }: MinimalTopNavProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const links = items && items.length > 0 ? items.slice(0, 6) : SAMPLE;
  const shell = variant === 'expressive' ? 'bg-surface-raised shadow-ui-1' : variant === 'nocturne' ? 'bg-surface border-b-2 border-hairline-strong' : 'bg-surface';
  const linkClass = 'rounded-ui-sm px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-raised hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

  return (
    <header className={`w-full border-b border-hairline font-body text-ink ${shell}`}>
      <nav aria-label="Main" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <a href={brandHref} className="rounded-ui-sm font-heading text-lg font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
          {brand}
        </a>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-menu`}
          onClick={() => setOpen((o) => !o)}
          className="rounded-ui-sm border border-hairline-strong px-3 py-2 text-sm font-medium text-ink md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Menu
        </button>
        <div id={`${id}-menu`} className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-1 pb-2 md:flex md:w-auto md:flex-row md:items-center md:pb-0`}>
          <ul className="flex flex-col gap-1 md:flex-row">
            {links.map((l) => (
              <li key={`${l.href}-${l.label}`}>
                <a href={l.href} className={`block ${linkClass}`}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          {actionLabel && (
            <a
              href={actionHref}
              className="mt-1 inline-flex justify-center rounded-ui-sm bg-accent px-4 py-2 text-sm font-semibold text-on-accent hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus md:ml-2 md:mt-0"
            >
              {actionLabel}
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
