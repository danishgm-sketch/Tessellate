import React from 'react';

export type DashboardKpiGridVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DashboardKpiGridProps {
  variant?: DashboardKpiGridVariant;
  title?: string;
  cards?: Array<{label:string;val:string;status:string}>;
}

export function DashboardKpiGrid({ variant = 'quiet', title = 'Sample operational summary', cards: suppliedCards }: DashboardKpiGridProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'border-neutral-200 bg-neutral-50/50';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
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
    <div style={{borderRadius:'var(--tess-radius-md,12px)'}} className={`w-full p-6 border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-2 @md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} style={{borderRadius:'var(--tess-radius-sm,8px)'}} className={`p-4 border ${card}`}>
            <span className="text-[11px] font-mono uppercase text-[var(--tess-ink-muted,#62666F)] mb-1 block">{c.label}</span>
            <div className="text-2xl font-bold font-mono tracking-tight mb-2">{c.val}</div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 ${variant==='nocturne'?'text-emerald-300':'text-emerald-800'} font-bold`}>
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
