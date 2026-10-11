import React from 'react';

export type EntityListVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EntityListProps {
  variant?: EntityListVariant;
}

export function EntityList({ variant = 'quiet' }: EntityListProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const entities = [
    { name: 'Sarah Connor', role: 'Security Architect', status: 'Online' },
    { name: 'Miles Dyson', role: 'Systems Engineer', status: 'Offline' },
    { name: 'John Croft', role: 'Product Lead', status: 'In Meeting' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Team Directory</h3>
      <div className="space-y-3">
        {entities.map((e) => (
          <div key={e.name} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800 font-bold flex items-center justify-center">
                {e.name.charAt(0)}
              </span>
              <div>
                <div className="font-semibold">{e.name}</div>
                <div className="text-[11px] opacity-60">{e.role}</div>
              </div>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
              {e.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
