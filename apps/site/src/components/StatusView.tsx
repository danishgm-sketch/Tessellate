import React, { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface QueueHealth {
  hostOnline: boolean;
  pendingTasks: number;
  estimatedWaitSeconds: number;
  latency?: { count: number; p50Ms: number | null; p95Ms: number | null };
  checkedAt?: string;
}

type Probe<T> = { state: 'loading' } | { state: 'ok'; data: T } | { state: 'down'; message: string };

function seconds(ms: number | null | undefined): string {
  if (ms == null) return '—';
  return ms < 1000 ? '< 1 s' : `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`;
}

function Row({ label, state, detail }: { label: string; state: 'up' | 'degraded' | 'down' | 'loading'; detail: string }) {
  const tone = {
    up: { dot: 'bg-[#177B55]', text: 'Operational' },
    degraded: { dot: 'bg-[#A66A15]', text: 'Limited' },
    down: { dot: 'bg-[#C83D48]', text: 'Unavailable' },
    loading: { dot: 'bg-[#C7C3BA]', text: 'Checking…' },
  }[state];
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 py-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="mt-0.5 text-sm text-[#62666F]">{detail}</p>
      </div>
      <span className="inline-flex items-center gap-2 text-sm font-medium">
        <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} aria-hidden />
        {tone.text}
      </span>
    </li>
  );
}

export function StatusView() {
  const [api, setApi] = useState<Probe<{ status: string }>>({ state: 'loading' });
  const [queue, setQueue] = useState<Probe<QueueHealth>>({ state: 'loading' });
  const [checked, setChecked] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    const [a, q] = await Promise.allSettled([apiFetch<{ status: string }>('/health'), apiFetch<QueueHealth>('/api/inference/health')]);
    setApi(a.status === 'fulfilled' ? { state: 'ok', data: a.value } : { state: 'down', message: 'The API is not responding.' });
    setQueue(q.status === 'fulfilled' ? { state: 'ok', data: q.value } : { state: 'down', message: 'Queue status is unavailable.' });
    setChecked(new Date());
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 30_000);
    return () => clearInterval(t);
  }, [refresh]);

  const q = queue.state === 'ok' ? queue.data : null;

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-[#ECE9E2] rounded-xl border border-[#D9D6CF] bg-white px-5" aria-live="polite">
        <Row label="Website, catalogue and Workbench" state="up" detail="Browsing, editing and export run in your browser and keep working even when other services are down." />
        <Row
          label="Accounts and cloud sync"
          state={api.state === 'loading' ? 'loading' : api.state === 'ok' ? 'up' : 'down'}
          detail={api.state === 'down' ? api.message : 'Sign-in, sync, publishing and the intelligence queue API.'}
        />
        <Row
          label="Intelligence host (composition and natural-language edits)"
          state={!q ? (queue.state === 'loading' ? 'loading' : 'down') : q.hostOnline ? (q.pendingTasks > 20 ? 'degraded' : 'up') : 'down'}
          detail={
            !q
              ? queue.state === 'down'
                ? queue.message
                : 'Checking…'
              : q.hostOnline
                ? `${q.pendingTasks} request(s) waiting · typical response ${seconds(q.latency?.p50Ms)} (95% within ${seconds(q.latency?.p95Ms)})`
                : 'The host that runs Tessellate’s model is offline. New requests wait in the queue and run when it reconnects; nothing is guessed in the meantime.'
          }
        />
      </ul>
      <p className="text-xs text-[#62666F]">
        {checked ? `Last checked ${checked.toLocaleTimeString()} · refreshes every 30 seconds.` : 'Checking…'}{' '}
        <button type="button" onClick={() => void refresh()} className="font-medium text-[#2547E8] hover:underline">
          Check now
        </button>
      </p>
    </div>
  );
}
