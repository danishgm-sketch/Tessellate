import React from 'react';

export type EntityProfileHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EntityProfileHeaderProps {
  /** Record title; defaults to the record's first field. */
  heading?: string;
  description?: string;
  entity?: string;
  /** Fields of the record, in display order. */
  fields?: string[];
  record?: Record<string, string | number | boolean | null>;
  sampleData?: boolean;
  /** Primary action, e.g. "Edit appointment". */
  actionLabel?: string;
  onAction?: () => void;
  variant?: EntityProfileHeaderVariant;
}

const SAMPLE: Record<string, string | number | boolean | null> = { name: 'Amira Khan', status: 'Active', created: '2026-01-12' };

/** Header for a single record: initials avatar, title, status, key facts and a primary action. */
export function EntityProfileHeader({ heading, description, entity = 'record', fields, record, sampleData, actionLabel, onAction, variant = 'quiet' }: EntityProfileHeaderProps) {
  const data = record ?? SAMPLE;
  const keys = fields && fields.length > 0 ? fields : Object.keys(data);
  const title = heading ?? String(data[keys[0]!] ?? entity);
  const statusKey = keys.find((k) => k.toLowerCase() === 'status');
  const facts = keys.slice(1).filter((k) => k !== statusKey).slice(0, 4);
  const initials = title
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const shell = variant === 'expressive' ? 'bg-surface-raised shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'bg-surface border-2 border-hairline-strong' : 'bg-surface-raised border border-hairline';

  return (
    <header className={`w-full rounded-ui-lg p-4 font-body text-ink sm:p-5 ${shell}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft font-heading text-base font-semibold text-ink">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">{entity}</p>
            <h1 className="truncate font-heading text-xl font-semibold">{title}</h1>
            {description && <p className="text-sm text-ink-secondary">{description}</p>}
          </div>
          {statusKey && data[statusKey] != null && (
            <span className="rounded-ui-xs border border-hairline-strong px-2 py-0.5 text-xs font-medium">{String(data[statusKey])}</span>
          )}
        </div>
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="rounded-ui-sm bg-accent px-4 py-2 text-sm font-semibold text-on-accent hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {facts.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map((k) => (
            <div key={k}>
              <dt className="text-xs text-ink-secondary">{k.charAt(0).toUpperCase() + k.slice(1)}</dt>
              <dd className="text-sm font-medium">{String(data[k] ?? '—')}</dd>
            </div>
          ))}
        </dl>
      )}
      {(sampleData ?? !record) && <p className="mt-3 text-xs text-ink-secondary">Sample record</p>}
    </header>
  );
}
