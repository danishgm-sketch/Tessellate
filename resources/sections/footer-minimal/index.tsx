import React from 'react';

export type FooterMinimalVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterMinimalProps {
  brand?: string;
  items?: FooterLink[];
  /** Copyright line; defaults to "© <year> <brand>". */
  copyright?: string;
  /** Legal links such as Privacy and Terms. */
  legalItems?: FooterLink[];
  variant?: FooterMinimalVariant;
}

/** Compact footer: brand, links, legal links and copyright. */
export function FooterMinimal({
  brand = 'Your product',
  items = [],
  copyright,
  legalItems = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
  variant = 'quiet',
}: FooterMinimalProps) {
  const shell = variant === 'expressive' ? 'bg-surface-raised' : variant === 'nocturne' ? 'bg-surface border-t-2 border-hairline-strong' : 'bg-surface';
  const link = 'rounded-ui-xs text-sm text-ink-secondary underline-offset-2 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

  return (
    <footer className={`w-full border-t border-hairline px-4 py-8 font-body text-ink sm:px-6 ${shell}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <p className="font-heading text-base font-semibold">{brand}</p>
        {items.length > 0 && (
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {items.slice(0, 8).map((l) => (
                <li key={`${l.href}-${l.label}`}>
                  <a href={l.href} className={link}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4 text-sm text-ink-secondary">
        <p>{copyright ?? `© ${new Date().getFullYear()} ${brand}`}</p>
        <ul className="flex gap-4">
          {legalItems.map((l) => (
            <li key={l.href}>
              <a href={l.href} className={link}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
