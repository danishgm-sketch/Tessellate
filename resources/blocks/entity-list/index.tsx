import React, { useId } from 'react';

export type EntityListVariant = 'quiet' | 'expressive' | 'nocturne';

export type EntityListRow = Record<string, string | number | boolean | null>;

export interface EntityListProps {
  heading?: string;
  description?: string;
  entity?: string;
  /** Fields to show: the first is the title, the second the subtitle, the third a status badge. */
  columns?: string[];
  rows?: EntityListRow[];
  sampleData?: boolean;
  /** Builds a link for each item; when omitted items are not links. */
  hrefFor?: (row: EntityListRow) => string;
  loading?: boolean;
  emptyMessage?: string;
  variant?: EntityListVariant;
}

const SAMPLE: EntityListRow[] = [
  { name: 'Amira Khan', created: '2026-01-12', status: 'Active' },
  { name: 'Ben Carter', created: '2026-01-15', status: 'Pending' },
  { name: 'Chloe Martin', created: '2026-01-18', status: 'Completed' },
];

/** Compact list of records with title, subtitle and status; good for side panels and mobile. */
export function EntityList({ heading, description, entity = 'record', columns, rows, sampleData, hrefFor, loading = false, emptyMessage, variant = 'quiet' }: EntityListProps) {
  const id = useId();
  const data = rows ?? SAMPLE;
  const cols = columns && columns.length > 0 ? columns : Object.keys(data[0] ?? { name: '' });
  const [titleKey, subtitleKey, statusKey] = [cols[0]!, cols[1], cols.find((c) => c.toLowerCase() === 'status') ?? cols[2]];
  const plural = `${entity.toLowerCase()}s`;
  const shell = variant === 'expressive' ? 'bg-surface-raised shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'bg-surface border-2 border-hairline-strong' : 'bg-surface-raised border border-hairline';

  return (
    <section className={`w-full rounded-ui-lg font-body text-ink ${shell}`} aria-labelledby={`${id}-heading`} aria-busy={loading}>
      <div className="px-4 pt-4">
        <h2 id={`${id}-heading`} className="font-heading text-lg font-semibold">
          {heading ?? `${entity.charAt(0).toUpperCase()}${entity.slice(1)}s`}
        </h2>
        {description && <p className="mt-0.5 text-sm text-ink-secondary">{description}</p>}
        {(sampleData ?? !rows) && <p className="mt-0.5 text-xs text-ink-secondary">Sample data</p>}
      </div>
      {loading ? (
        <p role="status" className="px-4 py-6 text-sm text-ink-secondary">
          Loading {plural}…
        </p>
      ) : data.length === 0 ? (
        <p className="px-4 py-6 text-sm text-ink-secondary">{emptyMessage ?? `No ${plural} yet.`}</p>
      ) : (
        <ul className="mt-2 divide-y divide-hairline">
          {data.map((row, i) => {
            const title = String(row[titleKey] ?? '');
            const body = (
              <>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{title}</span>
                  {subtitleKey && subtitleKey !== statusKey && <span className="block truncate text-sm text-ink-secondary">{String(row[subtitleKey] ?? '')}</span>}
                </span>
                {statusKey && row[statusKey] != null && (
                  <span className="shrink-0 rounded-ui-xs border border-hairline-strong px-2 py-0.5 text-xs font-medium text-ink">{String(row[statusKey])}</span>
                )}
              </>
            );
            return (
              <li key={`${title}-${i}`}>
                {hrefFor ? (
                  <a href={hrefFor(row)} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus">
                    {body}
                  </a>
                ) : (
                  <div className="flex items-center justify-between gap-3 px-4 py-3">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
