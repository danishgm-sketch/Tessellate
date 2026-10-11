import React from 'react';

export type PinnedItemsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PinnedItemsProps {
  variant?: PinnedItemsVariant;
}

export function PinnedItems({ variant = 'quiet' }: PinnedItemsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'border-neutral-200 bg-neutral-50/60';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    card = 'border-blue-100 bg-white shadow-2xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'border-[#2E3440] bg-[#151921]';
  }

  const pinned = [
    { title: 'Core Design DNA Palette', desc: 'Active project palette: Nocturne Cyber' },
    { title: 'Executive Admin Shell', desc: 'Canonical 3-pane responsive container' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Pinned Workspaces</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pinned.map((p) => (
          <div key={p.title} className={`p-4 rounded-lg border ${card}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs">{p.title}</span>
              <span className="text-amber-500 text-xs">★</span>
            </div>
            <p className="text-[11px] opacity-70 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
