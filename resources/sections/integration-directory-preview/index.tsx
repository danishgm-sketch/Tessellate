import React, { useState } from 'react';

export type IntegrationDirectoryPreviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface IntegrationDirectoryPreviewProps {
  variant?: IntegrationDirectoryPreviewVariant;
}

export function IntegrationDirectoryPreview({ variant = 'quiet' }: IntegrationDirectoryPreviewProps) {
  const [filter, setFilter] = useState('All');
  const items = [
    { name: 'GitHub OAuth Sync', cat: 'Auth' },
    { name: 'Cloudflare D1 Adapter', cat: 'Database' },
    { name: 'Orama Search Engine', cat: 'Search' },
    { name: 'Lucide Icon Mapper', cat: 'Assets' },
  ];

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const filtered = filter === 'All' ? items : items.filter((i) => i.cat === filter);

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Plugin Directory</h2>

        <div className="flex flex-wrap justify-center gap-2 mb-10 text-xs">
          {['All', 'Auth', 'Database', 'Search', 'Assets'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full border transition-colors ${
                filter === cat ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div key={item.name} className={`p-4 rounded-xl border flex items-center justify-between ${card}`}>
              <span className="font-semibold text-xs sm:text-sm">{item.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">{item.cat}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
