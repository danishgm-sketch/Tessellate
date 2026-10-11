import React from 'react';

export type DashboardKpiStripVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DashboardKpiStripProps {
  variant?: DashboardKpiStripVariant;
  kpis?: Array<{ label: string; value: string; delta: string; positive?: boolean }>;
}

export function DashboardKpiStrip({
  variant = 'quiet',
  kpis = [
    { label: 'Active Sessions', value: '18,429', delta: '+12.4%', positive: true },
    { label: 'P99 Latency', value: '1.24 ms', delta: '-8.1%', positive: true },
    { label: 'Error Rate', value: '0.002%', delta: '-0.01%', positive: true },
    { label: 'Throughput', value: '4.8M req/s', delta: '+18.0%', positive: true },
  ],
}: DashboardKpiStripProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'border-neutral-200 bg-neutral-50/50';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/50 text-neutral-950 border-[#D9D6CF]';
    card = 'border-blue-100 bg-white shadow-xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'border-[#2E3440] bg-[#151921]';
  }

  return (
    <div className={`w-full p-4 rounded-xl border transition-colors ${bg}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={`p-4 rounded-lg border ${card}`}>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1 block">{k.label}</span>
            <div className="text-2xl font-bold font-mono tracking-tight mb-1">{k.value}</div>
            <span className={`text-xs font-semibold ${k.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {k.delta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
