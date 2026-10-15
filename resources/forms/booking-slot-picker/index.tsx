import React, { useId, useMemo, useState } from 'react';

export type BookingSlotPickerVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BookingDay {
  /** ISO date, e.g. "2026-01-12". */
  date: string;
  /** Available start times, e.g. ["09:00", "09:45"]. */
  slots: string[];
}

export interface BookingSlotPickerProps {
  heading?: string;
  description?: string;
  /** What is being booked, e.g. "Appointment". */
  entity?: string;
  /** Availability by day. When omitted, an example week is shown and labelled as sample data. */
  days?: BookingDay[];
  /** Length of each slot in minutes, shown to the user. */
  durationMinutes?: number;
  onSelect?: (slot: { date: string; time: string }) => void;
  loading?: boolean;
  errorMessage?: string;
  locale?: string;
  variant?: BookingSlotPickerVariant;
}

function sampleWeek(): BookingDay[] {
  const times = ['09:00', '09:45', '10:30', '11:15', '13:00', '13:45', '14:30', '15:15', '16:00'];
  return Array.from({ length: 5 }, (_, i) => ({
    date: new Date(Date.UTC(2026, 0, 12 + i)).toISOString().slice(0, 10),
    slots: times.filter((_, j) => (i * 7 + j * 3) % 4 !== 0),
  }));
}

/** Day tabs plus a keyboard-navigable grid of time slots; exactly one slot can be chosen. */
export function BookingSlotPicker({
  heading,
  description,
  entity = 'appointment',
  days,
  durationMinutes = 45,
  onSelect,
  loading = false,
  errorMessage,
  locale = 'en-GB',
  variant = 'quiet',
}: BookingSlotPickerProps) {
  const id = useId();
  const sample = !days;
  const data = useMemo(() => days ?? sampleWeek(), [days]);
  const [dayIndex, setDayIndex] = useState(0);
  const [selected, setSelected] = useState<{ date: string; time: string } | null>(null);
  const day = data[dayIndex];
  const label = (iso: string, opts: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale, { timeZone: 'UTC', ...opts });

  const choose = (time: string) => {
    if (!day) return;
    const slot = { date: day.date, time };
    setSelected(slot);
    onSelect?.(slot);
  };

  const shell = variant === 'expressive' ? 'shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'border-2 border-hairline-strong' : 'border border-hairline';

  return (
    <section className={`w-full rounded-ui-lg bg-surface-raised p-6 font-body text-ink ${shell}`} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="font-heading text-xl font-semibold">
        {heading ?? `Choose a time for your ${entity.toLowerCase()}`}
      </h2>
      <p className="mt-1 text-sm text-ink-secondary">
        {description ?? `Each ${entity.toLowerCase()} lasts ${durationMinutes} minutes.`}
        {sample && ' (Example availability.)'}
      </p>
      <div role="alert" className="mt-3 empty:hidden">
        {errorMessage && <p className="rounded-ui-sm border border-danger bg-surface px-3 py-2 text-sm text-danger">{errorMessage}</p>}
      </div>

      {loading ? (
        <p role="status" className="mt-6 text-sm text-ink-secondary">
          Loading availability…
        </p>
      ) : data.length === 0 ? (
        <p className="mt-6 text-sm text-ink-secondary">No times are available right now. Please try another week.</p>
      ) : (
        <>
          <div role="tablist" aria-label="Day" className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {data.map((d, i) => (
              <button
                key={d.date}
                role="tab"
                type="button"
                id={`${id}-tab-${i}`}
                aria-selected={i === dayIndex}
                aria-controls={`${id}-panel`}
                tabIndex={i === dayIndex ? 0 : -1}
                onClick={() => setDayIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const next = (i + (e.key === 'ArrowRight' ? 1 : data.length - 1)) % data.length;
                    setDayIndex(next);
                    (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
                  }
                }}
                className={`shrink-0 rounded-ui-sm border px-3 py-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                  i === dayIndex ? 'border-accent bg-accent-soft text-ink' : 'border-hairline bg-surface text-ink-secondary hover:border-hairline-strong'
                }`}
              >
                <span className="block font-semibold text-ink">{label(d.date, { weekday: 'short' })}</span>
                <span className="block">{label(d.date, { day: 'numeric', month: 'short' })}</span>
              </button>
            ))}
          </div>
          <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${dayIndex}`} className="mt-4">
            {day && day.slots.length > 0 ? (
              <fieldset>
                <legend className="sr-only">Available times on {label(day.date, { weekday: 'long', day: 'numeric', month: 'long' })}</legend>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {day.slots.map((time) => {
                    const isSelected = selected?.date === day.date && selected.time === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => choose(time)}
                        className={`rounded-ui-sm border px-2 py-2 text-sm font-medium transition-colors duration-150 ease-ui motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                          isSelected ? 'border-accent bg-accent text-on-accent' : 'border-hairline-strong bg-surface-raised text-ink hover:bg-surface'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : (
              <p className="text-sm text-ink-secondary">No times left on this day.</p>
            )}
          </div>
          <p role="status" aria-live="polite" className="mt-4 text-sm text-ink">
            {selected ? `Selected: ${label(selected.date, { weekday: 'long', day: 'numeric', month: 'long' })} at ${selected.time}` : 'No time selected yet.'}
          </p>
        </>
      )}
    </section>
  );
}
