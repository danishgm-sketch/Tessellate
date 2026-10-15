import React, { useId, useState } from 'react';

export type ContactFormVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ContactMessage {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export interface ContactFormProps {
  heading?: string;
  description?: string;
  /** Topics the visitor can choose from. */
  topics?: string[];
  onSubmit?: (message: ContactMessage) => void | Promise<void>;
  errorMessage?: string;
  loading?: boolean;
  /** Expected response time shown after sending, e.g. "one working day". */
  responseTime?: string;
  variant?: ContactFormVariant;
}

const control =
  'w-full rounded-ui-sm border border-hairline-strong bg-surface-raised px-3 py-2.5 text-base text-ink ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-danger';

/** Contact or support request form with topic, validation and a sent confirmation. */
export function ContactForm({
  heading = 'Get in touch',
  description = 'Send us a message and we will reply by email.',
  topics = ['General question', 'Booking', 'Billing', 'Something is not working'],
  onSubmit,
  errorMessage,
  loading = false,
  responseTime = 'one working day',
  variant = 'quiet',
}: ContactFormProps) {
  const id = useId();
  const [m, setM] = useState<ContactMessage>({ name: '', email: '', topic: topics[0] ?? '', message: '' });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const errors = {
    name: m.name.trim() ? '' : 'Enter your name.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email) ? '' : 'Enter a valid email address.',
    message: m.message.trim().length >= 10 ? '' : 'Write at least a sentence so we can help.',
  };
  const isLoading = loading || busy;
  const shell = variant === 'expressive' ? 'shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'border-2 border-hairline-strong' : 'border border-hairline';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.values(errors).some(Boolean) || !onSubmit) return;
    setBusy(true);
    try {
      await onSubmit(m);
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <section role="status" className={`w-full max-w-xl rounded-ui-lg bg-surface-raised p-6 font-body text-ink ${shell}`}>
        <h2 className="font-heading text-xl font-semibold">Message sent</h2>
        <p className="mt-2 text-sm text-ink-secondary">Thanks, {m.name.split(' ')[0]}. We usually reply within {responseTime}.</p>
      </section>
    );
  }

  const err = (key: keyof typeof errors) =>
    touched && errors[key] ? (
      <p id={`${id}-${key}-error`} className="text-sm text-danger">
        {errors[key]}
      </p>
    ) : null;

  return (
    <section className={`w-full max-w-xl rounded-ui-lg bg-surface-raised p-6 font-body text-ink ${shell}`} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="font-heading text-xl font-semibold">
        {heading}
      </h2>
      <p className="mt-1 text-sm text-ink-secondary">{description}</p>
      <div role="alert" className="mt-3 empty:hidden">
        {errorMessage && <p className="rounded-ui-sm border border-danger bg-surface px-3 py-2 text-sm text-danger">{errorMessage}</p>}
      </div>
      <form className="mt-4 grid gap-4 sm:grid-cols-2" noValidate onSubmit={submit} aria-busy={isLoading}>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-name`} className="block text-sm font-medium text-ink">Name</label>
          <input id={`${id}-name`} autoComplete="name" value={m.name} onChange={(e) => setM((p) => ({ ...p, name: e.target.value }))} aria-invalid={touched && Boolean(errors.name)} aria-describedby={touched && errors.name ? `${id}-name-error` : undefined} className={control} />
          {err('name')}
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-email`} className="block text-sm font-medium text-ink">Email</label>
          <input id={`${id}-email`} type="email" autoComplete="email" value={m.email} onChange={(e) => setM((p) => ({ ...p, email: e.target.value }))} aria-invalid={touched && Boolean(errors.email)} aria-describedby={touched && errors.email ? `${id}-email-error` : undefined} className={control} />
          {err('email')}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor={`${id}-topic`} className="block text-sm font-medium text-ink">Topic</label>
          <select id={`${id}-topic`} value={m.topic} onChange={(e) => setM((p) => ({ ...p, topic: e.target.value }))} className={control}>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor={`${id}-message`} className="block text-sm font-medium text-ink">Message</label>
          <textarea id={`${id}-message`} rows={5} value={m.message} onChange={(e) => setM((p) => ({ ...p, message: e.target.value }))} aria-invalid={touched && Boolean(errors.message)} aria-describedby={touched && errors.message ? `${id}-message-error` : undefined} className={control} />
          {err('message')}
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-ui-sm bg-accent px-4 py-2.5 text-base font-semibold text-on-accent transition-colors duration-150 ease-ui hover:bg-accent-hover disabled:opacity-70 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {isLoading ? 'Sending…' : 'Send message'}
          </button>
        </div>
      </form>
    </section>
  );
}
