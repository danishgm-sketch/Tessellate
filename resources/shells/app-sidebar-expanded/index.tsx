import React, { useId } from 'react';

export type AppSidebarExpandedVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AppSidebarNavItem {
  label: string;
  href: string;
}

export interface AppSidebarExpandedProps {
  /** Product name shown at the top of the navigation. */
  brand?: string;
  /** Navigation links, usually one per primary screen. */
  items?: AppSidebarNavItem[];
  /** The current page, marked with aria-current. Defaults to the first item. */
  activeHref?: string;
  /** Text for the signed-in user area, e.g. their name. */
  userLabel?: string;
  variant?: AppSidebarExpandedVariant;
}

const SAMPLE_ITEMS: AppSidebarNavItem[] = [
  { label: 'Overview', href: '/overview' },
  { label: 'Records', href: '/records' },
  { label: 'Reports', href: '/reports' },
  { label: 'Settings', href: '/settings' },
];

/**
 * Application navigation: a vertical sidebar from the md breakpoint, and a horizontally scrollable bar on
 * small screens so content keeps the full width.
 */
export function AppSidebarExpanded({ brand = 'Your product', items, activeHref, userLabel, variant = 'quiet' }: AppSidebarExpandedProps) {
  const id = useId();
  const links = items && items.length > 0 ? items : SAMPLE_ITEMS;
  const current = activeHref ?? links[0]?.href;
  const shell =
    variant === 'expressive' ? 'bg-surface-raised shadow-ui-1' : variant === 'nocturne' ? 'bg-surface border-hairline-strong' : 'bg-surface';

  return (
    <nav
      aria-labelledby={`${id}-brand`}
      className={`flex w-full shrink-0 flex-row items-center gap-3 border-b border-hairline px-3 py-2 font-body text-ink md:min-h-full md:w-60 md:flex-col md:items-stretch md:gap-1 md:border-b-0 md:border-r md:px-3 md:py-4 ${shell}`}
    >
      <span id={`${id}-brand`} className="shrink-0 truncate px-2 font-heading text-sm font-semibold md:mb-4 md:text-base">
        {brand}
      </span>
      <ul className="flex min-w-0 flex-1 flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {links.map((item) => {
          const active = item.href === current;
          return (
            <li key={`${item.href}-${item.label}`} className="shrink-0">
              <a
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`block whitespace-nowrap rounded-ui-sm px-3 py-2 text-sm transition-colors duration-150 ease-ui motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                  active ? 'bg-accent-soft font-semibold text-ink' : 'text-ink-secondary hover:bg-surface-raised hover:text-ink'
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
      {userLabel && <p className="hidden truncate border-t border-hairline px-2 pt-3 text-sm text-ink-secondary md:mt-auto md:block">{userLabel}</p>}
    </nav>
  );
}
