import React, { useId } from 'react';

export type DashboardKpiGridVariant = 'quiet' | 'expressive' | 'nocturne';

export interface KpiMetric {
  label: string;
  value: string | number;
  /** Change since the last period, e.g. "+12%" or "-3". */
  change?: string;
  /** Whether the change is good news (colours the change). */
  positive?: boolean;
  /** Marks the value as sample data. */
  sample?: boolean;
}

export interface DashboardKpiGridProps {
  heading?: string;
  description?: string;
  metrics?: KpiMetric[];
  loading?: boolean;
  variant?: DashboardKpiGridVariant;
}

const SAMPLE: KpiMetric[] = [
  { label: 'Bookings this week', value: 128, change: '+12%', positive: true, sample: true },
  { label: 'New clients', value: 24, change: '+3', positive: true, sample: true },
  { label: 'No-shows', value: 4, change: '-2', positive: true, sample: true },
  { label: 'Revenue', value: '£6,420', change: '+8%', positive: true, sample: true },
];

/** Key numbers in a responsive grid (1, 2 or 4 columns), each with an optional change indicator. */
export function DashboardKpiGrid({ heading, description, metrics, loading = false, variant = 'quiet' }: DashboardKpiGridProps) {
  const id = useId();
  const items = metrics && metrics.length > 0 ? metrics : SAMPLE;
  const card = variant === 'expressive' ? 'bg-surface-raised shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'bg-surface border-2 border-hairline-strong' : 'bg-surface-raised border border-hairline';

  return (
    <section className="w-full font-body text-ink" aria-labelledby={heading ? `${id}-heading` : undefined} aria-label={heading ? undefined : 'Key numbers'} aria-busy={loading}>
      {heading && (
        <h2 id={`${id}-heading`} className="mb-1 font-heading text-lg font-semibold">
          {heading}
        </h2>
      )}
      {description && <p className="mb-3 text-sm text-ink-secondary">{description}</p>}
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((m) => (
          <div key={m.label} className={`rounded-ui-md p-4 ${card}`}>
            <dt className="text-sm text-ink-secondary">{m.label}</dt>
            <dd className="mt-1 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-semibold tabular-nums">{loading ? '—' : m.value}</span>
              {!loading && m.change && (
                <span className={`text-sm font-medium ${m.positive === false ? 'text-danger' : 'text-success'}`}>
                  <span className="sr-only">Change: </span>
                  {m.change}
                </span>
              )}
            </dd>
            {m.sample && <dd className="mt-1 text-xs text-ink-secondary">Sample</dd>}
          </div>
        ))}
      </dl>
      {loading && (
        <p role="status" className="sr-only">
          Loading numbers…
        </p>
      )}
    </section>
  );
}
