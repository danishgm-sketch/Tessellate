import React, { useId, useState } from 'react';

export type SignUpFormVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SignUpValues {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface SignUpFormProps {
  productName?: string;
  heading?: string;
  description?: string;
  onSubmit?: (values: SignUpValues) => void | Promise<void>;
  errorMessage?: string;
  loading?: boolean;
  /** Minimum password length enforced in the form (the server must enforce it too). */
  minPasswordLength?: number;
  termsHref?: string;
  privacyHref?: string;
  signInHref?: string;
  submitLabel?: string;
  variant?: SignUpFormVariant;
}

const fieldClass =
  'w-full rounded-ui-sm border border-hairline-strong bg-surface-raised px-3 py-2.5 text-base text-ink placeholder:text-ink-muted ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-danger';
const linkClass = 'font-semibold text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-focus';

/** Account creation with name, email, password strength guidance and terms consent. */
export function SignUpForm({
  productName,
  heading = 'Create your account',
  description,
  onSubmit,
  errorMessage,
  loading = false,
  minPasswordLength = 10,
  termsHref = '/terms',
  privacyHref = '/privacy',
  signInHref = '/sign-in',
  submitLabel = 'Create account',
  variant = 'quiet',
}: SignUpFormProps) {
  const id = useId();
  const [values, setValues] = useState<SignUpValues>({ name: '', email: '', password: '', acceptTerms: false });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const errors = {
    name: values.name.trim() ? '' : 'Enter your name.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? '' : 'Enter a valid email address.',
    password: values.password.length >= minPasswordLength ? '' : `Use at least ${minPasswordLength} characters.`,
    acceptTerms: values.acceptTerms ? '' : 'Accept the terms to continue.',
  };
  const isLoading = loading || busy;
  const set = <K extends keyof SignUpValues>(key: K, value: SignUpValues[K]) => setValues((v) => ({ ...v, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.values(errors).some(Boolean) || !onSubmit) return;
    setBusy(true);
    try {
      await onSubmit(values);
    } finally {
      setBusy(false);
    }
  };

  const field = (key: 'name' | 'email' | 'password', label: string, type: string, autoComplete: string, hint?: string) => {
    const invalid = touched && Boolean(errors[key]);
    const describedBy = [hint ? `${id}-${key}-hint` : '', invalid ? `${id}-${key}-error` : ''].filter(Boolean).join(' ') || undefined;
    return (
      <div className="space-y-1.5">
        <label htmlFor={`${id}-${key}`} className="block text-sm font-medium text-ink">
          {label}
        </label>
        <input
          id={`${id}-${key}`}
          type={type}
          autoComplete={autoComplete}
          required
          value={values[key]}
          onChange={(e) => set(key, e.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={fieldClass}
        />
        {hint && (
          <p id={`${id}-${key}-hint`} className="text-sm text-ink-secondary">
            {hint}
          </p>
        )}
        {invalid && (
          <p id={`${id}-${key}-error`} className="text-sm text-danger">
            {errors[key]}
          </p>
        )}
      </div>
    );
  };

  const shell =
    variant === 'nocturne'
      ? 'bg-surface border-2 border-hairline-strong'
      : variant === 'expressive'
        ? 'bg-surface-raised border border-hairline shadow-ui-2'
        : 'bg-surface-raised border border-hairline';

  return (
    <section className={`mx-auto w-full max-w-md rounded-ui-lg p-6 sm:p-8 font-body text-ink ${shell}`} aria-labelledby={`${id}-heading`}>
      {productName && <p className="mb-2 text-sm font-semibold text-accent">{productName}</p>}
      <h1 id={`${id}-heading`} className="font-heading text-2xl font-semibold">
        {heading}
      </h1>
      {description && <p className="mt-1 text-sm text-ink-secondary">{description}</p>}
      <div role="alert" aria-live="assertive" className="mt-4 empty:hidden">
        {errorMessage && <p className="rounded-ui-sm border border-danger bg-surface px-3 py-2 text-sm text-danger">{errorMessage}</p>}
      </div>
      <form className="mt-4 space-y-4" noValidate onSubmit={submit} aria-busy={isLoading}>
        {field('name', 'Full name', 'text', 'name')}
        {field('email', 'Email', 'email', 'email')}
        {field('password', 'Password', 'password', 'new-password', `At least ${minPasswordLength} characters. A short phrase is easier to remember.`)}
        <div className="space-y-1.5">
          <label className="flex items-start gap-2 text-sm text-ink-secondary">
            <input
              type="checkbox"
              checked={values.acceptTerms}
              onChange={(e) => set('acceptTerms', e.target.checked)}
              aria-invalid={touched && Boolean(errors.acceptTerms)}
              className="h-6 w-6 shrink-0 accent-accent"
            />
            <span>
              I agree to the{' '}
              <a href={termsHref} className={linkClass}>
                terms
              </a>{' '}
              and{' '}
              <a href={privacyHref} className={linkClass}>
                privacy policy
              </a>
              .
            </span>
          </label>
          {touched && errors.acceptTerms && <p className="text-sm text-danger">{errors.acceptTerms}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-ui-sm bg-accent px-4 py-2.5 text-base font-semibold text-on-accent transition-colors duration-150 ease-ui hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {isLoading ? 'Creating account…' : submitLabel}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-secondary">
        Already have an account?{' '}
        <a href={signInHref} className={linkClass}>
          Sign in
        </a>
      </p>
    </section>
  );
}
