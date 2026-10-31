import React from 'react';

export type DashboardKpiGridVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DashboardKpiGridProps {
  variant?: DashboardKpiGridVariant;
  title?: string;
  cards?: Array<{ label: string; val: string; status: string }>;
}

export function DashboardKpiGrid({
  variant = 'quiet',
  title = 'Sample operational summary',
  cards: suppliedCards,
}: DashboardKpiGridProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'border-neutral-200 bg-neutral-50/50';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50 text-neutral-950 border-[#D9D6CF]';
    card = 'border-blue-100 bg-white shadow-xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'border-[#2E3440] bg-[#151921]';
  }

  const cards = suppliedCards ?? [
    { label: 'Active Clusters', val: '48', status: 'Healthy' },
    { label: 'Sync Latency', val: '12ms', status: 'Optimal' },
    { label: 'Replica Count', val: '144', status: 'Balanced' },
    { label: 'Memory Util', val: '42.1%', status: 'Nominal' },
    { label: 'CPU Load', val: '28.4%', status: 'Nominal' },
    { label: 'Storage Free', val: '8.4 TB', status: '82% free' },
  ];

  return (
    <div
      style={{
        borderRadius: 'var(--tess-radius-md,12px)',
        '--tess-ink-muted': variant === 'nocturne' ? '#A8AFBA' : '#62666F',
        '--tess-ink-secondary': variant === 'nocturne' ? '#D1D5DB' : '#4B5563',
      } as React.CSSProperties}
      className={`w-full p-6 border transition-colors ${bg}`}
    >
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {cards.length === 0 ? (
        <p
          role="status"
          aria-live="polite"
          className="rounded border border-dashed border-neutral-300 p-6 text-center text-sm opacity-75 dark:border-neutral-700"
        >
          No metrics to show yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-4">
          {cards.map((c) => {
            const isUnavailable =
              /no connected data|not connected|not configured|not available|no data|unavailable|illustrative only|example|sample|awaiting/i.test(
                c.status
              );
            const statusTone = isUnavailable
              ? variant === 'nocturne'
                ? 'bg-neutral-700/50 text-neutral-300'
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
              : `bg-emerald-500/10 ${variant === 'nocturne' ? 'text-emerald-300' : 'text-emerald-800'}`;
            return (
              <div
                key={c.label}
                style={{ borderRadius: 'var(--tess-radius-sm,8px)' }}
                className={`p-4 border ${card}`}
              >
                <span className="text-[11px] font-mono uppercase text-[var(--tess-ink-muted,#62666F)] mb-1 block">
                  {c.label}
                </span>
                <div className="text-2xl font-bold font-mono tracking-tight mb-2">{c.val}</div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${statusTone} font-bold`}
                >
                  {c.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
