import React, { useState } from 'react';

export type AdvancedDataTableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AdvancedDataTableProps {
  variant?: AdvancedDataTableVariant;
}

export function AdvancedDataTable({ variant = 'quiet' }: AdvancedDataTableProps) {
  const [selected, setSelected] = useState<number[]>([]);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const rows = [
    { id: 1, name: 'button', type: 'primitive', quality: 98, status: 'verified' },
    { id: 2, name: 'editorial-hero', type: 'section', quality: 96, status: 'verified' },
    { id: 3, name: 'admin-console-shell', type: 'block', quality: 96, status: 'verified' },
  ];

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className={`w-full rounded-xl border overflow-hidden transition-colors ${bg}`}>
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-xs">
        <span className="font-semibold">{selected.length} row(s) selected</span>
        <button type="button" className="px-3 py-1 rounded border font-mono">Filter</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="p-3 w-8">#</th>
              <th className="p-3">Resource Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Quality</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(r.id)}
                    onChange={() => toggle(r.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-3 font-semibold font-sans">{r.name}</td>
                <td className="p-3 opacity-75">{r.type}</td>
                <td className="p-3 text-emerald-600 font-bold">{r.quality}/100</td>
                <td className="p-3 uppercase text-[10px]">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
