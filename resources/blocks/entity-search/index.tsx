import React, { useId, useState } from 'react';

export type EntitySearchVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EntitySearchProps {
  variant?: EntitySearchVariant;
}

const EXAMPLE_ENTITIES = [
  { name: 'Project Alpha', id: 'prj_9824f' },
  { name: 'Design System Core', id: 'prj_4410b' },
];

export function EntitySearch({ variant = 'quiet' }: EntitySearchProps) {
  const searchId = useId();
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

  const trimmed = query.trim().toLowerCase();
  const matches = trimmed
    ? EXAMPLE_ENTITIES.filter(
        (item) => item.name.toLowerCase().includes(trimmed) || item.id.toLowerCase().includes(trimmed)
      )
    : EXAMPLE_ENTITIES;

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-3">Entity Lookup</h3>
      <label htmlFor={searchId} className="sr-only">
        Search example entities
      </label>
      <input
        id={searchId}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type entity name or ID..."
        className={`w-full p-2.5 rounded-lg border text-xs mb-4 outline-none focus-visible:ring-2 focus-visible:ring-[#2547E8] ${inputBorder}`}
      />
      <div className="space-y-2">
        {matches.length > 0 ? (
          matches.map((entity) => (
            <div
              key={entity.id}
              className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 text-xs flex justify-between items-center"
            >
              <span>Entity: <strong>{entity.name}</strong></span>
              <span className="font-mono text-[10px] opacity-70">ID: {entity.id}</span>
            </div>
          ))
        ) : (
          <p role="status" className="text-xs opacity-75">
            No matching example entities.
          </p>
        )}
      </div>
    </div>
  );
}
