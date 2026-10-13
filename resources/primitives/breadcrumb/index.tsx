import React from 'react';

export type BreadcrumbVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps {
  variant?: BreadcrumbVariant;
  items?: BreadcrumbItem[];
}

export const defaultBreadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Components', href: '/components' },
  { label: 'Breadcrumb', current: true },
];

export function Breadcrumb({ variant = 'quiet', items = defaultBreadcrumbItems }: BreadcrumbProps) {
  let activeColor = 'text-neutral-900 dark:text-neutral-100 font-semibold';
  if (variant === 'expressive') activeColor = 'text-[#2547E8] font-bold';
  if (variant === 'nocturne') activeColor = 'text-white font-semibold';

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-xs">
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              {it.href && !isLast ? (
                <a href={it.href} className="text-neutral-500 hover:text-neutral-900 transition-colors">
                  {it.label}
                </a>
              ) : (
                <span className={activeColor} aria-current={isLast ? 'page' : undefined}>
                  {it.label}
                </span>
              )}
              {!isLast && <span className="opacity-40 select-none">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
