import React, { useState } from 'react';

export type AISourceCitationsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AISourceCitationsProps {
  variant?: AISourceCitationsVariant;
}

export function AISourceCitations({ variant = 'quiet' }: AISourceCitationsProps) {
  const [activeCite, setActiveCite] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const sources = [
    { id: 1, title: 'DESIGN_SYSTEM.md', path: 'docs/DESIGN_SYSTEM.md#L45', quote: 'Nocturne palette mandates #0B0D10 canvas and minimum 4.5:1 text contrast.' },
    { id: 2, title: 'WORKBENCH_SPEC.md', path: 'docs/WORKBENCH_SPEC.md#L112', quote: 'Workbench state persists strictly in IndexedDB with zero cloud syncing required.' },
    { id: 3, title: 'DATA_CONTRACTS.md', path: 'docs/DATA_CONTRACTS.md#L88', quote: 'ResourceManifest schema enforces strict provenance, licensing, and 0 undeclared deps.' },
  ];

  return (
    <div className={`w-full p-5 rounded-xl border flex flex-col gap-3 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-semibold">Grounded Sources & Citations (3)</span>
        <span className="text-[10px] font-mono text-emerald-500">✓ 100% Verified</span>
      </div>

      <div className="space-y-2">
        {sources.map((src) => {
          const isSelected = activeCite === src.id;
          return (
            <div
              key={src.id}
              onClick={() => setActiveCite(isSelected ? null : src.id)}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium font-mono">[{src.id}] {src.title}</span>
                <span className="text-[10px] text-neutral-400 font-mono">{src.path}</span>
              </div>
              <p className="text-[11px] text-neutral-500 italic leading-relaxed">
                "{src.quote}"
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
