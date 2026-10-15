import React, { useId, useState } from 'react';

export type PasswordResetFormVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PasswordResetFormProps {
  productName?: string;
  heading?: string;
  description?: string;
  /** Sends the reset email. The form always shows the same confirmation, so it never reveals whether an account exists. */
  onSubmit?: (email: string) => void | Promise<void>;
  errorMessage?: string;
  loading?: boolean;
  signInHref?: string;
  variant?: PasswordResetFormVariant;
}

/** "Forgot password" request with an account-neutral confirmation message. */
export function PasswordResetForm({
  productName,
  heading = 'Reset your password',
  description = 'Enter the email you signed up with and we will send you a link to choose a new password.',
  onSubmit,
  errorMessage,
  loading = false,
  signInHref = '/sign-in',
  variant = 'quiet',
}: PasswordResetFormProps) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const invalid = touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isLoading = loading || busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !onSubmit) return;
    setBusy(true);
    try {
      await onSubmit(email);
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  const shell = variant === 'expressive' ? 'border border-hairline shadow-ui-2' : variant === 'nocturne' ? 'border-2 border-hairline-strong' : 'border border-hairline';

  return (
    <section className={`mx-auto w-full max-w-md rounded-ui-lg bg-surface-raised p-6 sm:p-8 font-body text-ink ${shell}`} aria-labelledby={`${id}-heading`}>
      {productName && <p className="mb-2 text-sm font-semibold text-accent">{productName}</p>}
      <h1 id={`${id}-heading`} className="font-heading text-2xl font-semibold">
        {heading}
      </h1>
      <div role="status" aria-live="polite">
        {sent ? (
          <p className="mt-4 rounded-ui-sm border border-success bg-surface px-3 py-2 text-sm text-ink">
            If an account exists for {email}, a reset link is on its way. Check your inbox and spam folder.
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink-secondary">{description}</p>
        )}
      </div>
      <div role="alert" className="mt-3 empty:hidden">
        {errorMessage && <p className="rounded-ui-sm border border-danger bg-surface px-3 py-2 text-sm text-danger">{errorMessage}</p>}
      </div>
      {!sent && (
        <form className="mt-4 space-y-4" noValidate onSubmit={submit} aria-busy={isLoading}>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-email`} className="block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={invalid}
              aria-describedby={invalid ? `${id}-error` : undefined}
              className="w-full rounded-ui-sm border border-hairline-strong bg-surface-raised px-3 py-2.5 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-danger"
            />
            {invalid && (
              <p id={`${id}-error`} className="text-sm text-danger">
                Enter a valid email address.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-ui-sm bg-accent px-4 py-2.5 text-base font-semibold text-on-accent transition-colors duration-150 ease-ui hover:bg-accent-hover disabled:opacity-70 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {isLoading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="mt-6 text-sm text-ink-secondary">
        <a href={signInHref} className="font-semibold text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-focus">
          Back to sign in
        </a>
      </p>
    </section>
  );
}
