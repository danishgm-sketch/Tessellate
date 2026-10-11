import React from 'react';

export type EntityProfileHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EntityProfileHeaderProps {
  variant?: EntityProfileHeaderVariant;
}

export function EntityProfileHeader({ variant = 'quiet' }: EntityProfileHeaderProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-neutral-200 dark:bg-neutral-800 font-bold text-xl flex items-center justify-center">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Tessellate Core</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                VERIFIED CREATOR
              </span>
            </div>
            <p className="text-xs opacity-60 font-mono">@tessellate • Open Core System</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="button" className="px-4 py-2 rounded-lg border text-xs font-semibold">Share</button>
          <button type="button" className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
