import React, { useId, useState } from 'react';

export type SignInFormVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SignInValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface SignInFormProps {
  /** Product name shown above the form. */
  productName?: string;
  heading?: string;
  description?: string;
  /** Called with the entered values; return a promise to show the loading state until it settles. */
  onSubmit?: (values: SignInValues) => void | Promise<void>;
  /** Error from the auth service, shown in an alert region (for example "Email or password is incorrect"). */
  errorMessage?: string;
  /** Show the loading state (for example while a parent is submitting). */
  loading?: boolean;
  forgotPasswordHref?: string;
  signUpHref?: string;
  submitLabel?: string;
  variant?: SignInFormVariant;
}

const fieldClass =
  'w-full rounded-ui-sm border border-hairline-strong bg-surface-raised px-3 py-2.5 text-base text-ink placeholder:text-ink-muted ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-danger';

/** Email and password sign-in with inline validation, accessible errors and a loading state. */
export function SignInForm({
  productName,
  heading = 'Sign in',
  description,
  onSubmit,
  errorMessage,
  loading = false,
  forgotPasswordHref = '/forgot-password',
  signUpHref = '/sign-up',
  submitLabel = 'Sign in',
  variant = 'quiet',
}: SignInFormProps) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const emailInvalid = touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordInvalid = touched && password.length === 0;
  const isLoading = loading || busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length === 0) return;
    if (!onSubmit) return;
    setBusy(true);
    try {
      await onSubmit({ email, password, remember });
    } finally {
      setBusy(false);
    }
  };

  // Variants change emphasis only; light/dark and brand colours come from the design tokens.
  const shell =
    variant === 'nocturne'
      ? 'bg-surface text-ink border-2 border-hairline-strong'
      : variant === 'expressive'
        ? 'bg-surface-raised text-ink shadow-ui-2 border border-hairline'
        : 'bg-surface-raised text-ink border border-hairline';

  return (
    <section className={`mx-auto w-full max-w-md rounded-ui-lg p-6 sm:p-8 font-body ${shell}`} aria-labelledby={`${id}-heading`}>
      {productName && <p className="mb-2 text-sm font-semibold text-accent">{productName}</p>}
      <h1 id={`${id}-heading`} className="font-heading text-2xl font-semibold">
        {heading}
      </h1>
      {description && <p className="mt-1 text-sm text-ink-secondary">{description}</p>}

      <div role="alert" aria-live="assertive" className="mt-4 empty:hidden">
        {errorMessage && (
          <p className="rounded-ui-sm border border-danger bg-surface px-3 py-2 text-sm text-danger">{errorMessage}</p>
        )}
      </div>

      <form className="mt-4 space-y-4" noValidate onSubmit={submit} aria-busy={isLoading}>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-email`} className="block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={emailInvalid}
            aria-describedby={emailInvalid ? `${id}-email-error` : undefined}
            className={fieldClass}
          />
          {emailInvalid && (
            <p id={`${id}-email-error`} className="text-sm text-danger">
              Enter a valid email address.
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor={`${id}-password`} className="block text-sm font-medium text-ink">
              Password
            </label>
            <a href={forgotPasswordHref} className="text-sm font-medium text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-focus">
              Forgot password?
            </a>
          </div>
          <input
            id={`${id}-password`}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={passwordInvalid}
            aria-describedby={passwordInvalid ? `${id}-password-error` : undefined}
            className={fieldClass}
          />
          {passwordInvalid && (
            <p id={`${id}-password-error`} className="text-sm text-danger">
              Enter your password.
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-secondary">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-6 w-6 shrink-0 accent-accent" />
          Keep me signed in
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-ui-sm bg-accent px-4 py-2.5 text-base font-semibold text-on-accent transition-colors duration-150 ease-ui hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {isLoading ? 'Signing in…' : submitLabel}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-secondary">
        New here?{' '}
        <a href={signUpHref} className="font-semibold text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-focus">
          Create an account
        </a>
      </p>
    </section>
  );
}
