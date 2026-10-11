import React from 'react';

export type RecentItemsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RecentItemsProps {
  variant?: RecentItemsVariant;
}

export function RecentItems({ variant = 'quiet' }: RecentItemsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const items = [
    { name: 'Analytics Dashboard Blueprint', type: 'Blueprint', time: '14m ago' },
    { name: 'Nocturne Trading Terminal', type: 'Showcase', time: '2h ago' },
    { name: 'Pricing Three Tier Component', type: 'Section', time: '1d ago' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Recent Documents</h3>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.name} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
            <div>
              <div className="font-semibold">{it.name}</div>
              <span className="text-[10px] font-mono opacity-50 uppercase">{it.type}</span>
            </div>
            <span className="font-mono text-[11px] opacity-60">{it.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
