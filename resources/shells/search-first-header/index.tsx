import React from 'react';

export type SearchFirstHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SearchFirstHeaderProps {
  variant?: SearchFirstHeaderVariant;
}

export function SearchFirstHeader({ variant = 'quiet' }: SearchFirstHeaderProps) {
  let header = 'bg-white border-b border-neutral-200 text-neutral-900';
  let input = 'bg-neutral-50 border-neutral-300';
  if (variant === 'nocturne') {
    header = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';
    input = 'bg-[#11141B] border-[#2E3440] text-white';
  }

  return (
    <header className={`w-full px-6 h-16 flex items-center justify-between gap-6 ${header}`}>
      <span className="font-semibold text-sm">Catalog</span>
      <div className="flex-1 max-w-xl">
        <input
          type="search"
          placeholder="Search 324 canonical resources..."
          className={`w-full rounded-lg border px-3 py-2 text-xs outline-none ${input}`}
        />
      </div>
      <div className="flex items-center gap-3 text-xs">
        <button className="h-8 w-8 rounded-full border flex items-center justify-center">🔔</button>
        <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold">U</div>
      </div>
    </header>
  );
}
