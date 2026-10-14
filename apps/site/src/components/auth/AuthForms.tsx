import React, { useCallback, useState } from 'react';
import { apiFetch, ApiError } from '../../lib/api';
import { Turnstile, turnstileSiteKey } from './Turnstile';

export const fieldClass =
  'w-full rounded-lg border border-[#C7C3BA] bg-white px-3 py-2.5 text-sm text-[#111217] placeholder:text-[#8B8F97] focus:border-[#2547E8] focus:outline-none focus:ring-2 focus:ring-[#2547E8]/25';
export const labelClass = 'block text-sm font-medium text-[#111217]';
export const primaryButtonClass =
  'inline-flex w-full items-center justify-center rounded-lg bg-[#2547E8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3CCD] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2547E8]';

const MIN_PASSWORD = 10;

function origin(): string {
  return typeof window === 'undefined' ? '' : window.location.origin;
}

function useCaptcha() {
  const [token, setToken] = useState<string | null>(null);
  const onToken = useCallback((t: string | null) => setToken(t), []);
  const required = Boolean(turnstileSiteKey());
  const headers = token ? { 'x-captcha-response': token } : undefined;
  return { token, onToken, required, headers, ready: !required || Boolean(token) };
}

function Status({ error, success }: { error?: string | null; success?: string | null }) {
  return (
    <div role="status" aria-live="polite">
      {error && <p className="rounded-lg border border-[#C83D48] bg-[#FCEDEE] px-3 py-2 text-sm text-[#8A1F29]">{error}</p>}
      {success && <p className="rounded-lg border border-[#177B55] bg-[#E8F5EE] px-3 py-2 text-sm text-[#0F5A3D]">{success}</p>}
    </div>
  );
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return 'Something went wrong. Please try again.';
}

export function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const captcha = useCaptcha();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters for your password.`);
    setBusy(true);
    try {
      await apiFetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: captcha.headers,
        json: { name: name.trim(), email: email.trim(), password, callbackURL: `${origin()}/account?welcome=1` },
      });
      setSentTo(email.trim());
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  };

  if (sentTo) {
    return (
      <div className="space-y-3" data-testid="signup-check-email">
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="text-sm text-[#62666F]">
          We sent a confirmation link to <strong className="text-[#111217]">{sentTo}</strong>. Open it to finish creating your
          account. The link expires in 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="su-name" className={labelClass}>Name</label>
        <input id="su-name" className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={80} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="su-email" className={labelClass}>Email</label>
        <input id="su-email" type="email" className={fieldClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="su-password" className={labelClass}>Password</label>
        <input
          id="su-password"
          type="password"
          className={fieldClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          aria-describedby="su-password-help"
        />
        <p id="su-password-help" className="text-xs text-[#62666F]">
          At least {MIN_PASSWORD} characters. A short phrase is easier to remember than symbols. Passwords found in known
          data breaches are refused.
        </p>
      </div>
      <Turnstile onToken={captcha.onToken} />
      <Status error={error} />
      <button type="submit" className={primaryButtonClass} disabled={busy || !captcha.ready}>
        {busy ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const captcha = useCaptcha();

  const next = () => {
    const raw = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('next');
    // Only same-site relative paths are allowed as post-sign-in destinations (no open redirects).
    return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/workbench';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setNeedsVerification(false);
    setBusy(true);
    try {
      await apiFetch('/api/auth/sign-in/email', { method: 'POST', headers: captcha.headers, json: { email: email.trim(), password } });
      window.location.href = next();
    } catch (err) {
      if (err instanceof ApiError && (err.code === 'EMAIL_NOT_VERIFIED' || err.status === 403) && /verif/i.test(err.message)) {
        setNeedsVerification(true);
        setError('Confirm your email address before signing in.');
      } else if (err instanceof ApiError && err.status === 401) {
        setError('That email and password do not match an account.');
      } else {
        setError(messageFor(err));
      }
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await apiFetch('/api/auth/send-verification-email', { method: 'POST', json: { email: email.trim(), callbackURL: `${origin()}/account?welcome=1` } });
      setNotice('A new confirmation link is on its way.');
    } catch (err) {
      setError(messageFor(err));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="si-email" className={labelClass}>Email</label>
        <input id="si-email" type="email" className={fieldClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="si-password" className={labelClass}>Password</label>
          <a href="/forgot-password" className="text-xs font-medium text-[#2547E8] hover:underline">Forgot password?</a>
        </div>
        <input id="si-password" type="password" className={fieldClass} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </div>
      <Turnstile onToken={captcha.onToken} />
      <Status error={error} success={notice} />
      {needsVerification && (
        <button type="button" onClick={() => void resend()} className="text-sm font-medium text-[#2547E8] hover:underline">
          Resend confirmation email
        </button>
      )}
      <button type="submit" className={primaryButtonClass} disabled={busy || !captcha.ready}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const captcha = useCaptcha();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await apiFetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: captcha.headers,
        json: { email: email.trim(), redirectTo: `${origin()}/reset-password` },
      });
      setDone(true);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <p className="text-sm text-[#62666F]" role="status">
        If an account exists for <strong className="text-[#111217]">{email}</strong>, we have emailed a link to reset the
        password. The link expires in one hour.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="fp-email" className={labelClass}>Email</label>
        <input id="fp-email" type="email" className={fieldClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </div>
      <Turnstile onToken={captcha.onToken} />
      <Status error={error} />
      <button type="submit" className={primaryButtonClass} disabled={busy || !captcha.ready}>
        {busy ? 'Sending…' : 'Email me a reset link'}
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  const params = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const token = params.get('token');
  const linkError = params.get('error');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (linkError || !token) {
    return (
      <div className="space-y-3" role="alert">
        <p className="text-sm text-[#8A1F29]">This reset link is invalid or has expired.</p>
        <a href="/forgot-password" className="text-sm font-medium text-[#2547E8] hover:underline">Request a new link</a>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters.`);
    if (password !== confirm) return setError('The two passwords do not match.');
    setBusy(true);
    try {
      await apiFetch('/api/auth/reset-password', { method: 'POST', json: { newPassword: password, token } });
      setDone(true);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-3" role="status">
        <p className="text-sm">Your password has been changed and you have been signed out everywhere.</p>
        <a href="/sign-in" className={primaryButtonClass}>Sign in</a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="rp-password" className={labelClass}>New password</label>
        <input id="rp-password" type="password" className={fieldClass} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={MIN_PASSWORD} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="rp-confirm" className={labelClass}>Confirm new password</label>
        <input id="rp-confirm" type="password" className={fieldClass} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
      </div>
      <Status error={error} />
      <button type="submit" className={primaryButtonClass} disabled={busy}>
        {busy ? 'Saving…' : 'Set new password'}
      </button>
    </form>
  );
}
