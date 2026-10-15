import React, { useId, useMemo } from 'react';

export type CalendarWeekVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CalendarEvent {
  title: string;
  /** ISO date-time, e.g. "2026-01-13T09:45". */
  start: string;
  detail?: string;
}

export interface CalendarWeekProps {
  heading?: string;
  description?: string;
  entity?: string;
  /** Explicit events. When omitted, events are built from rows/columns (the first date-like and text fields). */
  events?: CalendarEvent[];
  columns?: string[];
  rows?: Array<Record<string, string | number | boolean | null>>;
  sampleData?: boolean;
  /** First day shown (ISO date). Defaults to the Monday of the earliest event. */
  weekStart?: string;
  locale?: string;
  loading?: boolean;
  variant?: CalendarWeekVariant;
}

const SAMPLE: CalendarEvent[] = [
  { title: 'Initial assessment', start: '2026-01-12T09:00', detail: 'Amira Khan' },
  { title: 'Follow-up', start: '2026-01-13T10:30', detail: 'Ben Carter' },
  { title: 'Follow-up', start: '2026-01-14T14:00', detail: 'Chloe Martin' },
  { title: 'Group class', start: '2026-01-16T17:30' },
];

function eventsFromRows(columns: string[] | undefined, rows: CalendarWeekProps['rows']): CalendarEvent[] {
  if (!rows || rows.length === 0) return [];
  const cols = columns && columns.length > 0 ? columns : Object.keys(rows[0]!);
  const dateKey = cols.find((c) => /(date|time|start|when)/i.test(c));
  const titleKey = cols.find((c) => c !== dateKey && !/(status|id)$/i.test(c)) ?? cols[0]!;
  const detailKey = cols.find((c) => c !== dateKey && c !== titleKey && !/status/i.test(c));
  if (!dateKey) return [];
  return rows.map((r) => ({
    title: String(r[titleKey] ?? ''),
    start: String(r[dateKey] ?? '').replace(' ', 'T'),
    detail: detailKey ? String(r[detailKey] ?? '') : undefined,
  }));
}

function mondayOf(iso: string): Date {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d;
}

/** Five-day week view: one column per day on wide screens, an agenda list on small screens. */
export function CalendarWeek({
  heading,
  description,
  entity = 'appointment',
  events,
  columns,
  rows,
  sampleData,
  weekStart,
  locale = 'en-GB',
  loading = false,
  variant = 'quiet',
}: CalendarWeekProps) {
  const id = useId();
  const derived = useMemo(() => events ?? eventsFromRows(columns, rows), [events, columns, rows]);
  const data = derived.length > 0 ? derived : SAMPLE;
  const isSample = sampleData ?? derived.length === 0;
  const start = mondayOf(weekStart ?? [...data].map((e) => e.start).sort()[0] ?? '2026-01-12');
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const iso = d.toISOString().slice(0, 10);
    return {
      iso,
      label: d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }),
      events: data.filter((e) => e.start.slice(0, 10) === iso).sort((a, b) => a.start.localeCompare(b.start)),
    };
  });
  const shell = variant === 'expressive' ? 'bg-surface-raised shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'bg-surface border-2 border-hairline-strong' : 'bg-surface-raised border border-hairline';

  return (
    <section className={`w-full rounded-ui-lg p-4 font-body text-ink sm:p-5 ${shell}`} aria-labelledby={`${id}-heading`} aria-busy={loading}>
      <h2 id={`${id}-heading`} className="font-heading text-lg font-semibold">
        {heading ?? `This week’s ${entity.toLowerCase()}s`}
      </h2>
      {description && <p className="mt-0.5 text-sm text-ink-secondary">{description}</p>}
      {isSample && <p className="mt-0.5 text-xs text-ink-secondary">Sample schedule</p>}
      {loading ? (
        <p role="status" className="mt-4 text-sm text-ink-secondary">
          Loading the calendar…
        </p>
      ) : (
        <ol className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
          {days.map((day) => (
            <li key={day.iso} className="rounded-ui-md border border-hairline bg-surface p-3">
              <h3 className="text-sm font-semibold text-ink">
                <time dateTime={day.iso}>{day.label}</time>
              </h3>
              {day.events.length === 0 ? (
                <p className="mt-2 text-sm text-ink-secondary">Free</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {day.events.map((e, i) => (
                    <li key={i} className="rounded-ui-sm border-l-4 border-accent bg-surface-raised px-2 py-1.5">
                      <time dateTime={e.start} className="block text-xs font-medium text-ink-secondary">
                        {e.start.slice(11, 16) || 'All day'}
                      </time>
                      <span className="block text-sm font-medium text-ink">{e.title}</span>
                      {e.detail && <span className="block text-xs text-ink-secondary">{e.detail}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
