import React, { useId } from 'react';

export type EntityOverviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EntityOverviewProps {
  heading?: string;
  entity?: string;
  /** Fields in display order. Defaults to the record's keys. */
  fields?: string[];
  record?: Record<string, string | number | boolean | null>;
  sampleData?: boolean;
  loading?: boolean;
  variant?: EntityOverviewVariant;
}

const SAMPLE: Record<string, string | number | boolean | null> = {
  name: 'Amira Khan',
  status: 'Active',
  created: '2026-01-12',
  notes: 'Sample record: replace with real data.',
};

/** All details of one record as a labelled description list; long text fields span the full width. */
export function EntityOverview({ heading = 'Details', entity = 'record', fields, record, sampleData, loading = false, variant = 'quiet' }: EntityOverviewProps) {
  const id = useId();
  const data = record ?? SAMPLE;
  const keys = fields && fields.length > 0 ? fields : Object.keys(data);
  const shell = variant === 'expressive' ? 'bg-surface-raised shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'bg-surface border-2 border-hairline-strong' : 'bg-surface-raised border border-hairline';
  const isLong = (k: string) => /(note|description|summary|reason|address|message)/i.test(k) || String(data[k] ?? '').length > 60;

  return (
    <section className={`w-full rounded-ui-lg p-4 font-body text-ink sm:p-5 ${shell}`} aria-labelledby={`${id}-heading`} aria-busy={loading}>
      <h2 id={`${id}-heading`} className="font-heading text-lg font-semibold">
        {heading}
      </h2>
      <p className="mt-0.5 text-sm text-ink-secondary">
        {entity.charAt(0).toUpperCase() + entity.slice(1)}
        {(sampleData ?? !record) ? ' · sample data' : ''}
      </p>
      {loading ? (
        <p role="status" className="mt-4 text-sm text-ink-secondary">
          Loading details…
        </p>
      ) : (
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {keys.map((k) => (
            <div key={k} className={isLong(k) ? 'sm:col-span-2' : ''}>
              <dt className="text-sm text-ink-secondary">{k.charAt(0).toUpperCase() + k.slice(1)}</dt>
              <dd className="mt-0.5 whitespace-pre-line text-base text-ink">{data[k] == null || data[k] === '' ? '—' : String(data[k])}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
