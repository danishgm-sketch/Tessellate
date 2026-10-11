import React from 'react';

export type ComparisonTableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ComparisonTableProps {
  variant?: ComparisonTableVariant;
}

export function ComparisonTable({ variant = 'quiet' }: ComparisonTableProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const rows = [
    { metric: 'Gzip Size', modelA: '1.2 KB', modelB: '4.8 KB' },
    { metric: 'Parsing Speed', modelA: '0.4 ms', modelB: '2.1 ms' },
    { metric: 'Dependencies', modelA: '0 external', modelB: '4 libraries' },
  ];

  return (
    <div className={`w-full rounded-xl border overflow-hidden text-xs transition-colors ${bg}`}>
      <table className="w-full text-left">
        <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[11px]">
          <tr>
            <th className="p-3">Specification</th>
            <th className="p-3">Tessellate Pure</th>
            <th className="p-3">Generic Alternative</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
          {rows.map((r) => (
            <tr key={r.metric} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
              <td className="p-3 font-semibold font-sans">{r.metric}</td>
              <td className="p-3 text-emerald-600 font-bold">{r.modelA}</td>
              <td className="p-3 opacity-60">{r.modelB}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
