import React, { useState } from 'react';

export type SavedViewsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SavedViewsProps {
  variant?: SavedViewsVariant;
}

export function SavedViews({ variant = 'quiet' }: SavedViewsProps) {
  const [active, setActive] = useState('All Resources');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let tabActive = 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    tabActive = 'bg-[#2547E8] text-white shadow-2xs font-semibold';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    tabActive = 'bg-cyan-500 text-black font-semibold';
  }

  const views = ['All Resources', 'Verified Only', 'High Quality (≥90)', 'Recently Created'];

  return (
    <div className={`w-full p-4 rounded-xl border transition-colors ${bg}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {views.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setActive(v)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              active === v ? tabActive : 'border-neutral-200 dark:border-neutral-800 opacity-70 hover:opacity-100'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
