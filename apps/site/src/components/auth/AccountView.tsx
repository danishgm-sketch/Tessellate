import React, { useCallback, useEffect, useState } from 'react';
import { apiBase, apiFetch, ApiError, getMe, type MeResponse } from '../../lib/api';
import { fieldClass, labelClass } from './AuthForms';

interface SessionRow {
  id: string;
  token: string;
  createdAt: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}

const button =
  'inline-flex items-center justify-center rounded-lg border border-[#C7C3BA] bg-white px-3 py-2 text-sm font-medium text-[#111217] hover:bg-[#ECE9E2] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2547E8]';
const primary =
  'inline-flex items-center justify-center rounded-lg bg-[#2547E8] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1E3CCD] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2547E8]';

function Section({ title, children, tone }: { title: string; children: React.ReactNode; tone?: 'danger' }) {
  return (
    <section
      className={`rounded-xl border bg-white p-5 ${tone === 'danger' ? 'border-[#E6B4B9]' : 'border-[#D9D6CF]'}`}
      aria-labelledby={`h-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <h2 id={`h-${title.replace(/\s+/g, '-').toLowerCase()}`} className="mb-4 text-base font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function describeAgent(ua?: string | null): string {
  if (!ua) return 'Unknown device';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : '';
  return [browser, os].filter(Boolean).join(' on ');
}

export function AccountView() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [name, setName] = useState('');
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [pw, setPw] = useState({ current: '', next: '' });
  const [busy, setBusy] = useState<string | null>(null);

  const say = (tone: 'ok' | 'error', text: string) => setMessage({ tone, text });
  const fail = (err: unknown) => say('error', err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');

  const loadSessions = useCallback(async () => {
    const [list, current] = await Promise.all([
      apiFetch<SessionRow[]>('/api/auth/list-sessions'),
      apiFetch<{ session: { token: string } } | null>('/api/auth/get-session'),
    ]);
    setSessions(list ?? []);
    setCurrentToken(current?.session?.token ?? null);
  }, []);

  useEffect(() => {
    getMe()
      .then(async (res) => {
        if (!res.authenticated) {
          window.location.href = '/sign-in?next=/account';
          return;
        }
        setMe(res);
        setName(res.user?.name ?? '');
        await loadSessions();
        if (new URLSearchParams(window.location.search).get('welcome')) say('ok', 'Your email is confirmed. Welcome to Tessellate.');
      })
      .catch(fail);
  }, [loadSessions]);

  if (!me) return <p className="text-sm text-[#62666F]" role="status">Loading your account…</p>;

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    setMessage(null);
    try {
      await action();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <div role="status" aria-live="polite">
        {message && (
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              message.tone === 'error' ? 'border-[#C83D48] bg-[#FCEDEE] text-[#8A1F29]' : 'border-[#177B55] bg-[#E8F5EE] text-[#0F5A3D]'
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      <Section title="Profile">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void run('name', async () => {
              await apiFetch('/api/auth/update-user', { method: 'POST', json: { name: name.trim() } });
              say('ok', 'Your name has been updated.');
            });
          }}
        >
          <div className="min-w-[220px] flex-1 space-y-1.5">
            <label htmlFor="acc-name" className={labelClass}>Name</label>
            <input id="acc-name" className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
          </div>
          <button type="submit" className={primary} disabled={busy === 'name' || !name.trim()}>Save</button>
        </form>
        <p className="mt-3 text-sm text-[#62666F]">
          Email: <span className="text-[#111217]">{me.user?.email}</span>
          {me.user?.role === 'admin' && (
            <>
              {' · '}
              <a href="/admin" className="font-medium text-[#2547E8] hover:underline">Administration</a>
            </>
          )}
        </p>
      </Section>

      <Section title="Password">
        <form
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void run('pw', async () => {
              await apiFetch('/api/auth/change-password', {
                method: 'POST',
                json: { currentPassword: pw.current, newPassword: pw.next, revokeOtherSessions: true },
              });
              setPw({ current: '', next: '' });
              say('ok', 'Password changed. Other devices have been signed out.');
              await loadSessions();
            });
          }}
        >
          <div className="space-y-1.5">
            <label htmlFor="acc-pw-current" className={labelClass}>Current password</label>
            <input id="acc-pw-current" type="password" autoComplete="current-password" className={fieldClass} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="acc-pw-next" className={labelClass}>New password</label>
            <input id="acc-pw-next" type="password" autoComplete="new-password" minLength={10} className={fieldClass} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
          </div>
          <button type="submit" className={primary} disabled={busy === 'pw' || pw.next.length < 10 || !pw.current}>Change</button>
        </form>
      </Section>

      <Section title="Where you are signed in">
        <ul className="divide-y divide-[#ECE9E2]" aria-label="Active sessions">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
              <span>
                {describeAgent(s.userAgent)}
                <span className="text-[#62666F]"> · since {new Date(s.createdAt).toLocaleDateString()}</span>
                {s.token === currentToken && <span className="ml-2 rounded bg-[#E7EBFF] px-1.5 py-0.5 text-xs text-[#1E3CCD]">This device</span>}
              </span>
              {s.token !== currentToken && (
                <button
                  type="button"
                  className={button}
                  onClick={() =>
                    void run(`rev-${s.id}`, async () => {
                      await apiFetch('/api/auth/revoke-session', { method: 'POST', json: { token: s.token } });
                      await loadSessions();
                    })
                  }
                >
                  Sign out
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={button}
            onClick={() =>
              void run('rev-others', async () => {
                await apiFetch('/api/auth/revoke-other-sessions', { method: 'POST', json: {} });
                await loadSessions();
                say('ok', 'Signed out of all other devices.');
              })
            }
          >
            Sign out other devices
          </button>
          <button
            type="button"
            className={button}
            onClick={() =>
              void run('signout', async () => {
                await apiFetch('/api/auth/sign-out', { method: 'POST', json: {} });
                window.location.href = '/';
              })
            }
          >
            Sign out
          </button>
        </div>
      </Section>

      <Section title="Your data">
        <p className="mb-3 text-sm text-[#62666F]">
          Download everything Tessellate stores in the cloud for your account as JSON. Projects saved only in your browser are
          exported from the Projects page.
        </p>
        <a className={button} href={`${apiBase()}/api/me/export`} download>
          Download my data
        </a>
      </Section>

      <Section title="Delete account" tone="danger">
        <p className="mb-3 text-sm text-[#62666F]">
          Permanently deletes your account and cloud data after you confirm by email. This cannot be undone.
        </p>
        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-[#C83D48] px-3 py-2 text-sm font-semibold text-[#8A1F29] hover:bg-[#FCEDEE] disabled:opacity-60"
          disabled={busy === 'delete'}
          onClick={() => {
            if (!window.confirm('Send a confirmation link to delete your account permanently?')) return;
            void run('delete', async () => {
              await apiFetch('/api/auth/delete-user', { method: 'POST', json: { callbackURL: `${window.location.origin}/` } });
              say('ok', 'Check your email to confirm deleting your account.');
            });
          }}
        >
          Delete my account
        </button>
      </Section>
    </div>
  );
}
