import React, { useId, useState } from 'react';

export type BookingDetailsFormVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BookingDetails {
  name: string;
  email: string;
  phone: string;
  notes: string;
  consent: boolean;
}

export interface BookingDetailsFormProps {
  heading?: string;
  description?: string;
  entity?: string;
  /** Summary of the chosen slot, e.g. "Tuesday 13 January at 09:45". */
  selectedSlotLabel?: string;
  /** Deposit shown before confirming, e.g. "£20.00". */
  depositLabel?: string;
  onSubmit?: (details: BookingDetails) => void | Promise<void>;
  onBack?: () => void;
  errorMessage?: string;
  loading?: boolean;
  /** After a successful booking the form shows this confirmation instead of the fields. */
  confirmed?: boolean;
  privacyHref?: string;
  variant?: BookingDetailsFormVariant;
}

const control =
  'w-full rounded-ui-sm border border-hairline-strong bg-surface-raised px-3 py-2.5 text-base text-ink ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-danger';

/** Contact details and consent for a booking, with a confirmation state. */
export function BookingDetailsForm({
  heading,
  description,
  entity = 'appointment',
  selectedSlotLabel,
  depositLabel,
  onSubmit,
  onBack,
  errorMessage,
  loading = false,
  confirmed = false,
  privacyHref = '/privacy',
  variant = 'quiet',
}: BookingDetailsFormProps) {
  const id = useId();
  const [v, setV] = useState<BookingDetails>({ name: '', email: '', phone: '', notes: '', consent: false });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const errors = {
    name: v.name.trim() ? '' : 'Enter your name.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) ? '' : 'Enter a valid email address.',
    consent: v.consent ? '' : 'Agree to be contacted about this booking.',
  };
  const isLoading = loading || busy;
  const thing = entity.toLowerCase();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.values(errors).some(Boolean) || !onSubmit) return;
    setBusy(true);
    try {
      await onSubmit(v);
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  const shell = variant === 'expressive' ? 'shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'border-2 border-hairline-strong' : 'border border-hairline';

  if (confirmed || done) {
    return (
      <section role="status" className={`w-full max-w-xl rounded-ui-lg bg-surface-raised p-6 font-body text-ink ${shell}`}>
        <h2 className="font-heading text-xl font-semibold">Your {thing} is booked</h2>
        <p className="mt-2 text-sm text-ink-secondary">
          {selectedSlotLabel ? `${selectedSlotLabel}. ` : ''}A confirmation has been sent to {v.email || 'your email'}.
        </p>
      </section>
    );
  }

  const text = (key: 'name' | 'email' | 'phone', label: string, type: string, autoComplete: string, required: boolean) => {
    const invalid = touched && required && Boolean(errors[key as 'name' | 'email']);
    return (
      <div className="space-y-1.5">
        <label htmlFor={`${id}-${key}`} className="block text-sm font-medium text-ink">
          {label}
          {!required && <span className="text-ink-secondary"> (optional)</span>}
        </label>
        <input
          id={`${id}-${key}`}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={v[key]}
          onChange={(e) => setV((p) => ({ ...p, [key]: e.target.value }))}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-${key}-error` : undefined}
          className={control}
        />
        {invalid && (
          <p id={`${id}-${key}-error`} className="text-sm text-danger">
            {errors[key as 'name' | 'email']}
          </p>
        )}
      </div>
    );
  };

  return (
    <section className={`w-full max-w-xl rounded-ui-lg bg-surface-raised p-6 font-body text-ink ${shell}`} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="font-heading text-xl font-semibold">
        {heading ?? 'Your details'}
      </h2>
      <p className="mt-1 text-sm text-ink-secondary">{description ?? `We use these only to manage your ${thing}.`}</p>
      {(selectedSlotLabel || depositLabel) && (
        <dl className="mt-4 grid gap-1 rounded-ui-sm bg-surface p-3 text-sm">
          {selectedSlotLabel && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-secondary">When</dt>
              <dd className="font-medium text-ink">{selectedSlotLabel}</dd>
            </div>
          )}
          {depositLabel && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-secondary">Deposit due now</dt>
              <dd className="font-medium text-ink">{depositLabel}</dd>
            </div>
          )}
        </dl>
      )}
      <div role="alert" className="mt-3 empty:hidden">
        {errorMessage && <p className="rounded-ui-sm border border-danger bg-surface px-3 py-2 text-sm text-danger">{errorMessage}</p>}
      </div>
      <form className="mt-4 space-y-4" noValidate onSubmit={submit} aria-busy={isLoading}>
        {text('name', 'Full name', 'text', 'name', true)}
        {text('email', 'Email', 'email', 'email', true)}
        {text('phone', 'Phone', 'tel', 'tel', false)}
        <div className="space-y-1.5">
          <label htmlFor={`${id}-notes`} className="block text-sm font-medium text-ink">
            Anything we should know? <span className="text-ink-secondary">(optional)</span>
          </label>
          <textarea id={`${id}-notes`} rows={3} value={v.notes} onChange={(e) => setV((p) => ({ ...p, notes: e.target.value }))} className={control} />
        </div>
        <label className="flex items-start gap-2 text-sm text-ink-secondary">
          <input type="checkbox" checked={v.consent} onChange={(e) => setV((p) => ({ ...p, consent: e.target.checked }))} aria-invalid={touched && Boolean(errors.consent)} className="h-6 w-6 shrink-0 accent-accent" />
          <span>
            Contact me about this {thing}. See our{' '}
            <a href={privacyHref} className="font-semibold text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-focus">
              privacy policy
            </a>
            .
          </span>
        </label>
        {touched && errors.consent && <p className="text-sm text-danger">{errors.consent}</p>}
        <div className="flex flex-wrap gap-3">
          {onBack && (
            <button type="button" onClick={onBack} className="rounded-ui-sm border border-hairline-strong bg-surface-raised px-4 py-2.5 text-base font-medium text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-ui-sm bg-accent px-4 py-2.5 text-base font-semibold text-on-accent transition-colors duration-150 ease-ui hover:bg-accent-hover disabled:opacity-70 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {isLoading ? 'Booking…' : depositLabel ? `Confirm and pay ${depositLabel}` : `Confirm ${thing}`}
          </button>
        </div>
      </form>
    </section>
  );
}
