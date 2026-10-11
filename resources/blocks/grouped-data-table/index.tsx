import React from 'react';

export type GroupedDataTableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface GroupedDataTableProps {
  variant?: GroupedDataTableVariant;
}

export function GroupedDataTable({ variant = 'quiet' }: GroupedDataTableProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const groups = [
    {
      category: 'Primitives',
      items: [
        { name: 'Button', slug: 'button', size: '1.2 KB' },
        { name: 'Input', slug: 'input', size: '1.4 KB' },
      ],
    },
    {
      category: 'Shells',
      items: [
        { name: 'Minimal Top Nav', slug: 'minimal-top-nav', size: '2.8 KB' },
      ],
    },
  ];

  return (
    <div className={`w-full rounded-xl border overflow-hidden text-xs transition-colors ${bg}`}>
      <table className="w-full text-left">
        <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[11px]">
          <tr>
            <th className="p-3">Resource</th>
            <th className="p-3">Slug</th>
            <th className="p-3">Gzip Size</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <React.Fragment key={g.category}>
              <tr className="bg-neutral-50 dark:bg-neutral-900/60 font-mono font-bold text-[10px] uppercase text-neutral-500">
                <td colSpan={3} className="px-3 py-2">{g.category}</td>
              </tr>
              {g.items.map((it) => (
                <tr key={it.slug} className="border-b border-neutral-100 dark:border-neutral-900 hover:bg-neutral-50/50">
                  <td className="p-3 font-semibold">{it.name}</td>
                  <td className="p-3 font-mono opacity-70">{it.slug}</td>
                  <td className="p-3 font-mono opacity-70">{it.size}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
