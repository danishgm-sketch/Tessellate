import React from 'react';

export type EmptyCollectionStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EmptyCollectionStateProps {
  collectionName?: string;
  onCreate?: () => void;
  variant?: EmptyCollectionStateVariant;
  children?: React.ReactNode;
}

export function EmptyCollectionState({
  collectionName = 'Favorites',
  onCreate,
  variant = 'quiet',
  children,
}: EmptyCollectionStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800'
      : variant === 'expressive'
      ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
      : 'text-neutral-700 bg-neutral-100 border-neutral-200';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto text-center space-y-4 transition-colors ${containerBg}`}>
      <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border text-xl ${badgeColor}`}>
        📁
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight">
          Your &ldquo;{collectionName}&rdquo; collection is empty
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Bookmark components, sections, or patterns from the catalog to organize them into reusable design systems.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onCreate}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
        >
          Explore Catalog Resources
        </button>
      </div>

      {children}
    </div>
  );
}
