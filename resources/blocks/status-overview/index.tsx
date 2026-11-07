import React from 'react';

export type StatusOverviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface StatusOverviewProps {
  variant?: StatusOverviewVariant;
}

export function StatusOverview({ variant = 'quiet' }: StatusOverviewProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const services = [
    { name: 'Example service A', latency: '1.2ms' },
    { name: 'Example service B', latency: '0.4ms' },
    { name: 'Example service C', latency: '12ms' },
    { name: 'Example service D', latency: '3.1ms' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="text-sm font-semibold">Example status snapshot</h3>
        <span className="text-xs text-amber-700 font-mono font-bold">ILLUSTRATIVE DATA</span>
      </div>
      <div className="space-y-3 font-mono text-xs">
        {services.map((s) => (
          <div key={s.name} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neutral-400" />
              <span>{s.name}</span>
            </div>
            <span className="opacity-60">{s.latency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
