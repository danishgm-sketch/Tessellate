import React, { useState } from 'react';

export type ExpandableDataTableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ExpandableDataTableProps {
  variant?: ExpandableDataTableVariant;
}

export function ExpandableDataTable({ variant = 'quiet' }: ExpandableDataTableProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const rows = [
    { id: 1, name: 'Ingestion Cluster A', region: 'us-east-1', details: '12 active replicas. Last rebalanced 4m ago.' },
    { id: 2, name: 'Edge Gateway B', region: 'eu-west-1', details: 'Serving TLS 1.3 traffic. Zero dropped packets.' },
  ];

  return (
    <div className={`w-full rounded-xl border overflow-hidden text-xs transition-colors ${bg}`}>
      <table className="w-full text-left">
        <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[11px]">
          <tr>
            <th className="p-3 w-8"></th>
            <th className="p-3">Cluster Name</th>
            <th className="p-3">Region</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {rows.map((r) => (
            <React.Fragment key={r.id}>
              <tr
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 cursor-pointer"
              >
                <td className="p-3 text-neutral-400 font-mono">{expanded === r.id ? '▼' : '▶'}</td>
                <td className="p-3 font-semibold">{r.name}</td>
                <td className="p-3 font-mono opacity-70">{r.region}</td>
              </tr>
              {expanded === r.id && (
                <tr className="bg-neutral-50/50 dark:bg-neutral-900/30">
                  <td colSpan={3} className="p-4 pl-10 text-xs opacity-75 font-mono">
                    {r.details}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
