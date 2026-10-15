import React from 'react';

export type BreadcrumbHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbHeaderProps {
  /** Page title. */
  heading?: string;
  /** One line explaining what the page is for. */
  description?: string;
  /** Trail above the title; the last item is the current page. */
  breadcrumbs?: BreadcrumbItem[];
  /** Label of the primary page action, e.g. "New appointment". */
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: BreadcrumbHeaderVariant;
}

/** Page header with breadcrumb trail, title, description and an optional primary action. */
export function BreadcrumbHeader({
  heading = 'Page title',
  description,
  breadcrumbs,
  actionLabel,
  actionHref,
  onAction,
  variant = 'quiet',
}: BreadcrumbHeaderProps) {
  const shell = variant === 'expressive' ? 'bg-surface-raised shadow-ui-1' : variant === 'nocturne' ? 'bg-surface border-b-2 border-hairline-strong' : 'bg-transparent';
  const actionClass =
    'inline-flex items-center rounded-ui-sm bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors duration-150 ease-ui hover:bg-accent-hover motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

  return (
    <header className={`flex w-full flex-wrap items-end justify-between gap-4 border-b border-hairline px-4 py-5 font-body text-ink sm:px-6 ${shell}`}>
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-1">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-secondary">
              {breadcrumbs.map((b, i) => {
                const last = i === breadcrumbs.length - 1;
                return (
                  <li key={`${b.label}-${i}`} className="flex items-center gap-1">
                    {b.href && !last ? (
                      <a href={b.href} className="underline-offset-2 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-focus">
                        {b.label}
                      </a>
                    ) : (
                      <span aria-current={last ? 'page' : undefined}>{b.label}</span>
                    )}
                    {!last && <span aria-hidden="true">/</span>}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <h1 className="truncate font-heading text-2xl font-semibold">{heading}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-secondary">{description}</p>}
      </div>
      {actionLabel &&
        (actionHref ? (
          <a href={actionHref} className={actionClass}>
            {actionLabel}
          </a>
        ) : (
          <button type="button" onClick={onAction} className={actionClass}>
            {actionLabel}
          </button>
        ))}
    </header>
  );
}
