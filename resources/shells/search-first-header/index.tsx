import React, { useId, useState } from 'react';

export type SearchFirstHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SearchFirstHeaderProps {
  variant?: SearchFirstHeaderVariant;
}

export function SearchFirstHeader({ variant = 'quiet' }: SearchFirstHeaderProps) {
  const searchId = useId();
  const [query, setQuery] = useState('');
  const [showNotice, setShowNotice] = useState(false);

  let header = 'bg-white border-b border-neutral-200 text-neutral-900';
  let input = 'bg-neutral-50 border-neutral-300 text-neutral-900';
  let noticeCard = 'bg-white border-neutral-200 text-neutral-800';
  if (variant === 'nocturne') {
    header = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';
    input = 'bg-[#11141B] border-[#2E3440] text-white placeholder:text-neutral-400';
    noticeCard = 'bg-[#11141B] border-[#2E3440] text-neutral-200';
  }

  return (
    <header className={`relative w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6 ${header}`}>
      <span className="font-semibold text-sm shrink-0">Catalog</span>
      <div className="flex-1 min-w-0 max-w-xl">
        <label htmlFor={searchId} className="sr-only">
          Search resources
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search 324 canonical resources..."
          className={`w-full rounded-lg border px-3 py-2 text-xs focus-visible:ring-2 focus-visible:ring-[#2547E8] focus-visible:outline-none ${input}`}
        />
      </div>
      <div className="flex items-center gap-3 text-xs shrink-0">
        <button
          type="button"
          onClick={() => setShowNotice((previous) => !previous)}
          aria-label="Toggle example notifications"
          aria-expanded={showNotice}
          className="h-8 w-8 rounded-full border flex items-center justify-center"
        >
          <span aria-hidden="true">🔔</span>
        </button>
        <div
          aria-hidden="true"
          className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold"
        >
          U
        </div>
      </div>
      {showNotice && (
        <p
          role="status"
          className={`absolute right-4 top-full mt-1 max-w-[calc(100vw-2rem)] rounded-lg border px-3 py-2 text-xs shadow-md z-20 ${noticeCard}`}
        >
          Preview only: no live notifications connected.
        </p>
      )}
    </header>
  );
}
