import React, { useState } from 'react';

export type EntitySearchVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EntitySearchProps {
  variant?: EntitySearchVariant;
}

export function EntitySearch({ variant = 'quiet' }: EntitySearchProps) {
  const [query, setQuery] = useState('');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921]';
  }

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-3">Entity Lookup</h3>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type entity name or ID..."
        className={`w-full p-2.5 rounded-lg border text-xs mb-4 outline-none ${inputBorder}`}
      />
      <div className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 text-xs flex justify-between items-center">
        <span>Entity: <strong>Project Alpha</strong></span>
        <span className="font-mono text-[10px] opacity-60">ID: prj_9824f</span>
      </div>
    </div>
  );
}
