import React, { useState } from 'react';

export type TreemapVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TreemapProps {
  variant?: TreemapVariant;
}

export function Treemap({ variant = 'quiet' }: TreemapProps) {
  const [activeTile, setActiveTile] = useState<string | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const tiles = [
    { id: '1', name: 'Database Cluster', size: '1.2 TB', span: 'col-span-8 row-span-4', bg: variant === 'nocturne' ? 'bg-cyan-950/80 border-cyan-800' : variant === 'expressive' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-white' },
    { id: '2', name: 'Log Archives', size: '640 GB', span: 'col-span-4 row-span-4', bg: variant === 'nocturne' ? 'bg-indigo-950/80 border-indigo-800' : variant === 'expressive' ? 'bg-emerald-600 text-white' : 'bg-neutral-700 text-white' },
    { id: '3', name: 'Media Assets', size: '420 GB', span: 'col-span-5 row-span-3', bg: variant === 'nocturne' ? 'bg-purple-950/80 border-purple-800' : variant === 'expressive' ? 'bg-amber-600 text-white' : 'bg-neutral-500 text-white' },
    { id: '4', name: 'Search Indexes', size: '280 GB', span: 'col-span-4 row-span-3', bg: variant === 'nocturne' ? 'bg-rose-950/80 border-rose-800' : variant === 'expressive' ? 'bg-purple-600 text-white' : 'bg-neutral-400 text-neutral-900' },
    { id: '5', name: 'Snapshots', size: '150 GB', span: 'col-span-3 row-span-3', bg: variant === 'nocturne' ? 'bg-zinc-800 border-zinc-700' : variant === 'expressive' ? 'bg-indigo-600 text-white' : 'bg-neutral-300 text-neutral-900' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Storage Utilization Treemap</h4>
          <p className="text-xs text-neutral-500">Proportional partition by storage volume</p>
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400">Total: 2.69 TB</span>
      </div>

      <div className="grid grid-cols-12 grid-rows-7 gap-2 h-72 w-full">
        {tiles.map((t) => {
          const isHovered = activeTile === t.id;
          return (
            <div
              key={t.id}
              onMouseEnter={() => setActiveTile(t.id)}
              onMouseLeave={() => setActiveTile(null)}
              className={`${t.span} ${t.bg} p-3 rounded-lg flex flex-col justify-between border cursor-pointer transition-all duration-200 ${
                isHovered ? 'scale-[1.01] shadow-lg ring-2 ring-white/50' : 'opacity-90'
              }`}
            >
              <div className="text-xs font-semibold tracking-tight truncate">{t.name}</div>
              <div className="text-sm font-mono font-bold mt-1">{t.size}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
