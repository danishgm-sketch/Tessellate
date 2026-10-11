import React from 'react';

export type PaginationVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PaginationProps {
  variant?: PaginationVariant;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  variant = 'quiet',
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  let active = 'bg-neutral-900 text-white font-semibold';
  if (variant === 'expressive') active = 'bg-[#2547E8] text-white font-semibold shadow-xs';
  if (variant === 'nocturne') active = 'bg-white text-neutral-950 font-semibold shadow-xs';

  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
        const isCurrent = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`h-7 w-7 rounded border transition-colors ${
              isCurrent ? active : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {p}
          </button>
        );
      })}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      >
        Next
      </button>
    </div>
  );
}
