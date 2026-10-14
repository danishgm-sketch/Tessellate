import React, { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiError, getMe } from '../../lib/api';

type Tab = 'users' | 'queue' | 'devices' | 'reports' | 'audit';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  emailVerified?: boolean;
  createdAt: string;
}
interface Ticket {
  id: string;
  kind: string;
  tokenNumber: number;
  status: string;
  owner: string;
  promptPreview: string;
  error?: string;
  createdAt: string;
}
interface Device {
  id: string;
  name: string;
  createdAt: string;
  lastSeenAt?: string;
  revokedAt?: string;
}
interface Report {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string | null;
  status: string;
  createdAt: string;
}
interface AuditEntry {
  id: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  detail?: string | null;
  createdAt: string;
}

const btn =
  'inline-flex items-center rounded-md border border-[#C7C3BA] bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-[#ECE9E2] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2547E8]';
const th = 'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#62666F]';
const td = 'px-3 py-2 align-top text-sm';
const when = (iso?: string | null) => (iso ? new Date(iso).toLocaleString() : '—');

export function AdminView() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('users');
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    getMe()
      .then((me) => {
        if (!me.authenticated) window.location.href = '/sign-in?next=/admin';
        else setAllowed(me.user?.role === 'admin');
      })
      .catch(() => setAllowed(false));
  }, []);

  const report = (err: unknown) => setNotice({ tone: 'error', text: err instanceof ApiError ? err.message : 'Request failed.' });

  if (allowed === null) return <p role="status" className="text-sm text-[#62666F]">Checking access…</p>;
  if (!allowed) {
    return (
      <p role="alert" className="rounded-lg border border-[#C83D48] bg-[#FCEDEE] px-3 py-2 text-sm text-[#8A1F29]">
        This area is for Tessellate administrators.
      </p>
    );
  }

  const tabs: Array<[Tab, string]> = [
    ['users', 'Users'],
    ['queue', 'Intelligence queue'],
    ['devices', 'Daemon devices'],
    ['reports', 'Reports'],
    ['audit', 'Audit log'],
  ];

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Administration sections" className="flex flex-wrap gap-1 border-b border-[#D9D6CF]">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => {
              setTab(id);
              setNotice(null);
            }}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${tab === id ? 'border-[#2547E8] text-[#2547E8]' : 'border-transparent text-[#62666F] hover:text-[#111217]'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="status" aria-live="polite">
        {notice && (
          <p className={`rounded-lg border px-3 py-2 text-sm ${notice.tone === 'error' ? 'border-[#C83D48] bg-[#FCEDEE] text-[#8A1F29]' : 'border-[#177B55] bg-[#E8F5EE] text-[#0F5A3D]'}`}>
            {notice.text}
          </p>
        )}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'users' && <UsersPanel onError={report} onOk={(t) => setNotice({ tone: 'ok', text: t })} />}
        {tab === 'queue' && <QueuePanel onError={report} />}
        {tab === 'devices' && <DevicesPanel onError={report} onOk={(t) => setNotice({ tone: 'ok', text: t })} />}
        {tab === 'reports' && <ReportsPanel onError={report} />}
        {tab === 'audit' && <AuditPanel onError={report} />}
      </div>
    </div>
  );
}

function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#D9D6CF] bg-white">
      <table className="w-full min-w-[640px]">
        <thead className="border-b border-[#D9D6CF] bg-[#FAF9F6]">
          <tr>{head.map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-[#ECE9E2]">{children}</tbody>
      </table>
      {empty && <p className="px-3 py-6 text-center text-sm text-[#62666F]">Nothing here yet.</p>}
    </div>
  );
}

function UsersPanel({ onError, onOk }: { onError: (e: unknown) => void; onOk: (t: string) => void }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const load = useCallback(
    (q: string) =>
      apiFetch<{ users: AdminUser[] }>(`/api/admin/users${q ? `?search=${encodeURIComponent(q)}` : ''}`)
        .then((r) => setUsers(r.users ?? []))
        .catch(onError),
    [onError],
  );
  useEffect(() => void load(''), [load]);

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      onOk(ok);
      await load(search);
    } catch (err) {
      onError(err);
    }
  };

  return (
    <div className="space-y-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void load(search.trim());
        }}
      >
        <label className="sr-only" htmlFor="admin-user-search">Search users by email</label>
        <input id="admin-user-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email" className="w-72 rounded-md border border-[#C7C3BA] px-3 py-1.5 text-sm" />
        <button type="submit" className={btn}>Search</button>
      </form>
      <Table head={['User', 'Role', 'Status', 'Joined', 'Actions']} empty={users.length === 0}>
        {users.map((u) => (
          <tr key={u.id}>
            <td className={td}>
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-[#62666F]">{u.email}{u.emailVerified === false ? ' · unverified' : ''}</div>
            </td>
            <td className={td}>{u.role ?? 'user'}</td>
            <td className={td}>{u.banned ? <span className="text-[#8A1F29]">Suspended{u.banReason ? `: ${u.banReason}` : ''}</span> : 'Active'}</td>
            <td className={td}>{when(u.createdAt)}</td>
            <td className={`${td} space-x-1 whitespace-nowrap`}>
              {u.banned ? (
                <button className={btn} onClick={() => void act(() => apiFetch(`/api/admin/users/${u.id}/unban`, { method: 'POST', json: {} }), `${u.email} reinstated.`)}>
                  Reinstate
                </button>
              ) : (
                <button
                  className={btn}
                  onClick={() => {
                    const reason = window.prompt(`Reason for suspending ${u.email}?`);
                    if (reason && reason.trim().length >= 3) {
                      void act(() => apiFetch(`/api/admin/users/${u.id}/ban`, { method: 'POST', json: { reason: reason.trim() } }), `${u.email} suspended.`);
                    }
                  }}
                >
                  Suspend
                </button>
              )}
              <button
                className={btn}
                onClick={() =>
                  void act(
                    () => apiFetch(`/api/admin/users/${u.id}/role`, { method: 'POST', json: { role: u.role === 'admin' ? 'user' : 'admin' } }),
                    `Role updated for ${u.email}.`,
                  )
                }
              >
                {u.role === 'admin' ? 'Remove admin' : 'Make admin'}
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function QueuePanel({ onError }: { onError: (e: unknown) => void }) {
  const [data, setData] = useState<{ active: number; lastDeviceSeenAt: string | null; tickets: Ticket[] } | null>(null);
  const load = useCallback(() => apiFetch<{ active: number; lastDeviceSeenAt: string | null; tickets: Ticket[] }>('/api/admin/queue').then(setData).catch(onError), [onError]);
  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 5000);
    return () => clearInterval(t);
  }, [load]);
  if (!data) return <p role="status" className="text-sm text-[#62666F]">Loading queue…</p>;
  const online = data.lastDeviceSeenAt && Date.now() - Date.parse(data.lastDeviceSeenAt) < 45_000;
  return (
    <div className="space-y-3">
      <p className="text-sm">
        Host daemon: <strong className={online ? 'text-[#177B55]' : 'text-[#A66A15]'}>{online ? 'online' : 'offline'}</strong> · last seen {when(data.lastDeviceSeenAt)} · {data.active} active ticket(s)
      </p>
      <Table head={['#', 'Kind', 'Status', 'Owner', 'Prompt', 'Created', '']} empty={data.tickets.length === 0}>
        {data.tickets.map((t) => (
          <tr key={t.id}>
            <td className={td}>{t.tokenNumber}</td>
            <td className={td}>{t.kind}</td>
            <td className={td}>{t.status}{t.error ? <div className="text-xs text-[#8A1F29]">{t.error}</div> : null}</td>
            <td className={td}>{t.owner}</td>
            <td className={`${td} max-w-xs break-words text-xs text-[#62666F]`}>{t.promptPreview || '(purged)'}</td>
            <td className={td}>{when(t.createdAt)}</td>
            <td className={td}>
              {t.status === 'queued' && (
                <button className={btn} onClick={() => void apiFetch(`/api/admin/queue/${t.id}`, { method: 'DELETE' }).then(load).catch(onError)}>
                  Cancel
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function DevicesPanel({ onError, onOk }: { onError: (e: unknown) => void; onOk: (t: string) => void }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [name, setName] = useState('');
  const [issued, setIssued] = useState<{ name: string; token: string } | null>(null);
  const load = useCallback(() => apiFetch<{ devices: Device[] }>('/api/admin/devices').then((r) => setDevices(r.devices)).catch(onError), [onError]);
  useEffect(() => void load(), [load]);

  return (
    <div className="space-y-3">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          apiFetch<{ name: string; token: string }>('/api/admin/devices', { method: 'POST', json: { name: name.trim() } })
            .then((r) => {
              setIssued(r);
              setName('');
              onOk(`Device "${r.name}" registered.`);
              return load();
            })
            .catch(onError);
        }}
      >
        <label className="sr-only" htmlFor="device-name">New device name</label>
        <input id="device-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Studio PC" maxLength={64} className="w-64 rounded-md border border-[#C7C3BA] px-3 py-1.5 text-sm" />
        <button type="submit" className={btn} disabled={!name.trim()}>Issue token</button>
      </form>
      {issued && (
        <div className="rounded-lg border border-[#2547E8] bg-[#E7EBFF] p-3 text-sm" role="alert">
          <p className="font-medium">Token for {issued.name} — copy it now; it will not be shown again.</p>
          <code className="mt-2 block break-all rounded bg-white p-2 font-mono text-xs">{issued.token}</code>
          <p className="mt-2 text-xs text-[#62666F]">Set it as TESSELLATE_DAEMON_TOKEN in the daemon&apos;s environment.</p>
        </div>
      )}
      <Table head={['Device', 'Created', 'Last seen', 'Status', '']} empty={devices.length === 0}>
        {devices.map((d) => (
          <tr key={d.id}>
            <td className={td}>{d.name}</td>
            <td className={td}>{when(d.createdAt)}</td>
            <td className={td}>{when(d.lastSeenAt)}</td>
            <td className={td}>{d.revokedAt ? `Revoked ${when(d.revokedAt)}` : 'Active'}</td>
            <td className={td}>
              {!d.revokedAt && (
                <button
                  className={btn}
                  onClick={() => {
                    if (window.confirm(`Revoke ${d.name}? The daemon using it will stop immediately.`)) {
                      void apiFetch(`/api/admin/devices/${d.id}`, { method: 'DELETE' }).then(load).catch(onError);
                    }
                  }}
                >
                  Revoke
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function ReportsPanel({ onError }: { onError: (e: unknown) => void }) {
  const [reports, setReports] = useState<Report[]>([]);
  const load = useCallback(() => apiFetch<{ reports: Report[] }>('/api/admin/reports').then((r) => setReports(r.reports)).catch(onError), [onError]);
  useEffect(() => void load(), [load]);
  return (
    <Table head={['Target', 'Reason', 'Status', 'Received', '']} empty={reports.length === 0}>
      {reports.map((r) => (
        <tr key={r.id}>
          <td className={td}>{r.targetType}: {r.targetId}</td>
          <td className={td}>{r.reason}{r.details ? <div className="text-xs text-[#62666F]">{r.details}</div> : null}</td>
          <td className={td}>{r.status}</td>
          <td className={td}>{when(r.createdAt)}</td>
          <td className={td}>
            <label className="sr-only" htmlFor={`rs-${r.id}`}>Status for report {r.id}</label>
            <select
              id={`rs-${r.id}`}
              value={r.status}
              className="rounded-md border border-[#C7C3BA] px-2 py-1 text-xs"
              onChange={(e) => void apiFetch(`/api/admin/reports/${r.id}/status`, { method: 'POST', json: { status: e.target.value } }).then(load).catch(onError)}
            >
              {['pending', 'reviewing', 'resolved', 'dismissed'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </td>
        </tr>
      ))}
    </Table>
  );
}

function AuditPanel({ onError }: { onError: (e: unknown) => void }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  useEffect(() => {
    apiFetch<{ entries: AuditEntry[] }>('/api/admin/audit-log').then((r) => setEntries(r.entries)).catch(onError);
  }, [onError]);
  return (
    <Table head={['When', 'Action', 'Target', 'Detail', 'Actor']} empty={entries.length === 0}>
      {entries.map((e) => (
        <tr key={e.id}>
          <td className={td}>{when(e.createdAt)}</td>
          <td className={td}>{e.action}</td>
          <td className={td}>{e.targetType}{e.targetId ? `: ${e.targetId}` : ''}</td>
          <td className={td}>{e.detail ?? ''}</td>
          <td className={`${td} text-xs text-[#62666F]`}>{e.actorUserId}</td>
        </tr>
      ))}
    </Table>
  );
}
