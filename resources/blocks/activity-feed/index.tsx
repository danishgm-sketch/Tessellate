import React, { useId } from 'react';

export type ActivityFeedVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ActivityItem {
  actor: string;
  action: string;
  target?: string;
  /** ISO timestamp or a preformatted label such as "2 hours ago". */
  time: string;
}

export interface ActivityFeedProps {
  heading?: string;
  description?: string;
  items?: ActivityItem[];
  loading?: boolean;
  emptyMessage?: string;
  locale?: string;
  variant?: ActivityFeedVariant;
}

const SAMPLE: ActivityItem[] = [
  { actor: 'Amira Khan', action: 'booked', target: 'an appointment for Tuesday', time: '2026-01-12T09:15:00Z' },
  { actor: 'Ben Carter', action: 'paid', target: 'invoice 1042', time: '2026-01-12T08:40:00Z' },
  { actor: 'Chloe Martin', action: 'updated', target: 'treatment notes', time: '2026-01-11T16:05:00Z' },
];

function formatTime(value: string, locale: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

/** Recent activity as an ordered list of "who did what, when". */
export function ActivityFeed({ heading = 'Recent activity', description, items, loading = false, emptyMessage = 'Nothing has happened yet.', locale = 'en-GB', variant = 'quiet' }: ActivityFeedProps) {
  const id = useId();
  const data = items ?? SAMPLE;
  const shell = variant === 'expressive' ? 'bg-surface-raised shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'bg-surface border-2 border-hairline-strong' : 'bg-surface-raised border border-hairline';

  return (
    <section className={`w-full rounded-ui-lg p-4 font-body text-ink ${shell}`} aria-labelledby={`${id}-heading`} aria-busy={loading}>
      <h2 id={`${id}-heading`} className="font-heading text-lg font-semibold">
        {heading}
      </h2>
      {description && <p className="mt-0.5 text-sm text-ink-secondary">{description}</p>}
      {!items && <p className="mt-0.5 text-xs text-ink-secondary">Sample activity</p>}
      {loading ? (
        <p role="status" className="mt-4 text-sm text-ink-secondary">
          Loading activity…
        </p>
      ) : data.length === 0 ? (
        <p className="mt-4 text-sm text-ink-secondary">{emptyMessage}</p>
      ) : (
        <ol className="mt-3 space-y-3">
          {data.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
              <p className="text-sm text-ink">
                <span className="font-semibold">{item.actor}</span> {item.action}
                {item.target ? ` ${item.target}` : ''}
                <time dateTime={item.time} className="block text-xs text-ink-secondary">
                  {formatTime(item.time, locale)}
                </time>
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
