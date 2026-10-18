import React, { useState } from 'react';

export type AdvancedDataTableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AdvancedDataTableProps {
  variant?: AdvancedDataTableVariant;
  title?: string;
  rows?: Array<{id:number;name:string;type:string;quality:number;status:string;displayValue?:string}>;
  columnLabels?: {name:string;type:string;quality:string;status:string};
}

export function AdvancedDataTable({ variant = 'quiet', title='Sample records', rows: suppliedRows, columnLabels={name:'Name',type:'Type',quality:'Progress',status:'Status'} }: AdvancedDataTableProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [query,setQuery] = useState('');

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const rows = suppliedRows ?? [
    { id: 1, name: 'button', type: 'primitive', quality: 98, status: 'verified' },
    { id: 2, name: 'editorial-hero', type: 'section', quality: 96, status: 'verified' },
    { id: 3, name: 'admin-console-shell', type: 'block', quality: 96, status: 'verified' },
  ];
  const filteredRows = rows.filter((row) => `${row.name} ${row.type} ${row.status}`.toLowerCase().includes(query.toLowerCase()));

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className={`w-full rounded-[var(--tess-radius-xl,8px)] border overflow-hidden transition-colors ${bg}`}>
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-xs">
        <span className="font-semibold">{title} · {selected.length} selected</span>
        <input aria-label={`Filter ${title}`} value={query} onChange={event=>setQuery(event.target.value)} placeholder="Filter records" className="min-w-0 w-32 px-2 py-1 rounded border bg-transparent"/>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="p-3 w-8">#</th>
              <th className="p-3">{columnLabels.name}</th>
              <th className="p-3">{columnLabels.type}</th>
              <th className="p-3">{columnLabels.quality}</th>
              <th className="p-3">{columnLabels.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredRows.length > 0 ? filteredRows.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                <td className="p-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${r.name}`}
                    checked={selected.includes(r.id)}
                    onChange={() => toggle(r.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-3 font-semibold font-sans">{r.name}</td>
                <td className="p-3 opacity-75">{r.type}</td>
                <td className={`p-3 ${variant==='nocturne'?'text-emerald-300':'text-emerald-800'} font-bold`}>{r.displayValue ?? `${r.quality}/100`}</td>
                <td className="p-3 uppercase text-[10px]">{r.status}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-neutral-500">
                  <p role="status" aria-live="polite">{rows.length === 0 ? 'No records to show.' : 'No records match this filter.'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
