import React, { useId } from 'react';

export type SettingsNavigationVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SettingsSection {
  label: string;
  href: string;
  description?: string;
}

export interface SettingsNavigationProps {
  heading?: string;
  items?: SettingsSection[];
  /** Current section, marked with aria-current. Defaults to the first. */
  activeHref?: string;
  variant?: SettingsNavigationVariant;
}

const DEFAULT_SECTIONS: SettingsSection[] = [
  { label: 'Profile', href: '#profile', description: 'Name, email and photo' },
  { label: 'Notifications', href: '#notifications', description: 'Email and text reminders' },
  { label: 'Security', href: '#security', description: 'Password and sign-in' },
  { label: 'Billing', href: '#billing', description: 'Plan and invoices' },
];

/** Settings section navigation: a vertical list from md, a scrollable row on small screens. */
export function SettingsNavigation({ heading = 'Settings', items, activeHref, variant = 'quiet' }: SettingsNavigationProps) {
  const id = useId();
  const sections = items && items.length > 0 ? items : DEFAULT_SECTIONS;
  const current = activeHref ?? sections[0]?.href;
  const shell = variant === 'expressive' ? 'bg-surface-raised shadow-ui-1 border border-hairline' : variant === 'nocturne' ? 'bg-surface border-2 border-hairline-strong' : 'bg-surface-raised border border-hairline';

  return (
    <nav aria-labelledby={`${id}-heading`} className={`w-full rounded-ui-lg p-3 font-body text-ink md:w-64 ${shell}`}>
      <h2 id={`${id}-heading`} className="px-2 pb-2 font-heading text-base font-semibold">
        {heading}
      </h2>
      <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {sections.map((s) => {
          const active = s.href === current;
          return (
            <li key={s.href} className="shrink-0">
              <a
                href={s.href}
                aria-current={active ? 'page' : undefined}
                className={`block rounded-ui-sm px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                  active ? 'bg-accent-soft text-ink' : 'text-ink-secondary hover:bg-surface hover:text-ink'
                }`}
              >
                <span className="block text-sm font-semibold">{s.label}</span>
                {s.description && <span className={`hidden text-xs md:block ${active ? 'text-ink' : 'text-ink-secondary'}`}>{s.description}</span>}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
