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
    {
      id: 1,
      title: 'Example product brief',
      path: 'example/product-brief.md#overview',
      quote: 'Example excerpt: teams need a clear place to review the product brief.',
    },
    {
      id: 2,
      title: 'Example research notes',
      path: 'example/research-notes.md#finding-1',
      quote: 'Example excerpt: users asked for a simpler way to compare options.',
    },
    {
      id: 3,
      title: 'Example design review',
      path: 'example/design-review.md#navigation',
      quote: 'Example excerpt: keep the primary navigation visible on small screens.',
    },
  ];

  return (
    <div className={`w-full p-5 rounded-xl border flex flex-col gap-3 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="min-w-0 text-xs font-semibold">Example citations (3)</span>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Example citations. These sample sources were not retrieved or verified.
      </p>

      <div className="space-y-2">
        {sources.map((src) => {
          const isSelected = activeCite === src.id;
          return (
            <button
              key={src.id}
              type="button"
              onClick={() => setActiveCite(isSelected ? null : src.id)}
              aria-pressed={isSelected}
              aria-label={`Example source ${src.id}: ${src.title}`}
              className={`w-full text-left p-3 rounded-lg border text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium font-mono">
                  [{src.id}] {src.title}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">{src.path}</span>
              </div>
              <p className="text-[11px] text-neutral-500 italic leading-relaxed">"{src.quote}"</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
