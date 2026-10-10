import React, { useState } from 'react';

export type WorkspaceSwitcherVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WorkspaceSwitcherProps {
  variant?: WorkspaceSwitcherVariant;
}

export function WorkspaceSwitcher({ variant = 'quiet' }: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);

  let theme = 'bg-white border border-neutral-200 text-neutral-900';
  if (variant === 'expressive') theme = 'bg-white border border-[#D9D6CF] text-neutral-900 shadow-2xs';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border border-[#2E3440] text-white';

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium ${theme}`}
      >
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-[#2547E8] text-white flex items-center justify-center font-bold text-[10px]">T</div>
          <span>Tessellate HQ</span>
        </div>
        <span className="text-neutral-400">▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full rounded-lg border border-neutral-200 bg-white dark:bg-[#11141B] dark:border-neutral-800 p-1 shadow-lg z-20 text-xs">
          <button className="w-full text-left p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium">Tessellate HQ</button>
          <button className="w-full text-left p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">Acme Labs</button>
        </div>
      )}
    </div>
  );
}
