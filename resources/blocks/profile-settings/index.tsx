import React, { useId, useState } from 'react';

export type ProfileSettingsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProfileValues {
  name: string;
  email: string;
  phone: string;
  emailReminders: boolean;
  textReminders: boolean;
}

export interface ProfileSettingsProps {
  heading?: string;
  description?: string;
  /** Current values to edit. */
  initialValues?: Partial<ProfileValues>;
  onSave?: (values: ProfileValues) => void | Promise<void>;
  errorMessage?: string;
  loading?: boolean;
  variant?: ProfileSettingsVariant;
}

const control =
  'w-full rounded-ui-sm border border-hairline-strong bg-surface-raised px-3 py-2.5 text-base text-ink ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-danger';

/** Profile and notification preferences with validation and a saved confirmation. */
export function ProfileSettings({
  heading = 'Profile',
  description = 'How we contact you and how you appear to others.',
  initialValues,
  onSave,
  errorMessage,
  loading = false,
  variant = 'quiet',
}: ProfileSettingsProps) {
  const id = useId();
  const [v, setV] = useState<ProfileValues>({ name: '', email: '', phone: '', emailReminders: true, textReminders: false, ...initialValues });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const errors = {
    name: v.name.trim() ? '' : 'Enter your name.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) ? '' : 'Enter a valid email address.',
  };
  const isLoading = loading || busy;
  const shell = variant === 'expressive' ? 'bg-surface-raised shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'bg-surface border-2 border-hairline-strong' : 'bg-surface-raised border border-hairline';
  const set = <K extends keyof ProfileValues>(k: K, val: ProfileValues[K]) => {
    setSaved(false);
    setV((p) => ({ ...p, [k]: val }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.values(errors).some(Boolean) || !onSave) return;
    setBusy(true);
    try {
      await onSave(v);
      setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`w-full max-w-2xl rounded-ui-lg p-5 font-body text-ink ${shell}`} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="font-heading text-xl font-semibold">
        {heading}
      </h2>
      <p className="mt-1 text-sm text-ink-secondary">{description}</p>
      <div role="alert" className="mt-3 empty:hidden">
        {errorMessage && <p className="rounded-ui-sm border border-danger bg-surface px-3 py-2 text-sm text-danger">{errorMessage}</p>}
      </div>
      <form className="mt-4 grid gap-4 sm:grid-cols-2" noValidate onSubmit={submit} aria-busy={isLoading}>
        {(['name', 'email'] as const).map((k) => {
          const invalid = touched && Boolean(errors[k]);
          return (
            <div key={k} className="space-y-1.5">
              <label htmlFor={`${id}-${k}`} className="block text-sm font-medium">
                {k === 'name' ? 'Full name' : 'Email'}
              </label>
              <input
                id={`${id}-${k}`}
                type={k === 'email' ? 'email' : 'text'}
                autoComplete={k}
                value={v[k]}
                onChange={(e) => set(k, e.target.value)}
                aria-invalid={invalid}
                aria-describedby={invalid ? `${id}-${k}-error` : undefined}
                className={control}
              />
              {invalid && (
                <p id={`${id}-${k}-error`} className="text-sm text-danger">
                  {errors[k]}
                </p>
              )}
            </div>
          );
        })}
        <div className="space-y-1.5">
          <label htmlFor={`${id}-phone`} className="block text-sm font-medium">
            Phone <span className="text-ink-secondary">(optional)</span>
          </label>
          <input id={`${id}-phone`} type="tel" autoComplete="tel" value={v.phone} onChange={(e) => set('phone', e.target.value)} className={control} />
        </div>
        <fieldset className="space-y-2 sm:col-span-2">
          <legend className="text-sm font-medium">Reminders</legend>
          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <input type="checkbox" checked={v.emailReminders} onChange={(e) => set('emailReminders', e.target.checked)} className="h-6 w-6 shrink-0 accent-accent" />
            Email reminders
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <input type="checkbox" checked={v.textReminders} onChange={(e) => set('textReminders', e.target.checked)} className="h-6 w-6 shrink-0 accent-accent" />
            Text message reminders
          </label>
        </fieldset>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-ui-sm bg-accent px-4 py-2.5 text-base font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {isLoading ? 'Saving…' : 'Save changes'}
          </button>
          <span role="status" aria-live="polite" className="text-sm text-success">
            {saved ? 'Saved.' : ''}
          </span>
        </div>
      </form>
    </section>
  );
}
