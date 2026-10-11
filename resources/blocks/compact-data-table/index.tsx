import React from 'react';

export type CompactDataTableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CompactDataTableProps {
  variant?: CompactDataTableVariant;
}

export function CompactDataTable({ variant = 'quiet' }: CompactDataTableProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const items = [
    { key: 'CPU-0', load: '18%', temp: '42°C' },
    { key: 'CPU-1', load: '24%', temp: '44°C' },
    { key: 'CPU-2', load: '12%', temp: '40°C' },
    { key: 'CPU-3', load: '82%', temp: '58°C' },
  ];

  return (
    <div className={`w-full rounded-xl border overflow-hidden font-mono text-[11px] transition-colors ${bg}`}>
      <table className="w-full text-left">
        <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800">
          <tr>
            <th className="px-3 py-1.5">Core</th>
            <th className="px-3 py-1.5">Utilization</th>
            <th className="px-3 py-1.5">Temp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
          {items.map((it) => (
            <tr key={it.key} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
              <td className="px-3 py-1.5 font-bold">{it.key}</td>
              <td className="px-3 py-1.5">{it.load}</td>
              <td className="px-3 py-1.5 opacity-70">{it.temp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
