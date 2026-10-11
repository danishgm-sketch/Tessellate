import React from 'react';

export type UsageOverviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface UsageOverviewProps {
  variant?: UsageOverviewVariant;
}

export function UsageOverview({ variant = 'quiet' }: UsageOverviewProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const quotas = [
    { label: 'Cloud Checkpoints', used: '18 / 50', pct: '36%' },
    { label: 'Monthly AST Compilations', used: '14,200 / 50,000', pct: '28%' },
    { label: 'Active Developer Seats', used: '4 / 10', pct: '40%' },
  ];

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-base font-bold mb-6">Quota Utilization</h3>
      <div className="space-y-4">
        {quotas.map((q) => (
          <div key={q.label} className="space-y-1 text-xs">
            <div className="flex justify-between font-medium">
              <span>{q.label}</span>
              <span className="font-mono opacity-70">{q.used}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div style={{ width: q.pct }} className="h-full bg-neutral-900 dark:bg-white rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
