import React, { useState } from 'react';

export type FileBrowserVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FileBrowserProps {
  variant?: FileBrowserVariant;
}

export function FileBrowser({ variant = 'quiet' }: FileBrowserProps) {
  const [open, setOpen] = useState(true);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={`w-full p-6 rounded-xl border font-mono text-xs transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4 font-sans">Repository Files</h3>
      <div className="space-y-1">
        <div onClick={() => setOpen(!open)} className="cursor-pointer font-bold flex items-center gap-1.5 py-1">
          <span>{open ? '▾' : '▸'}</span>
          <span>resources/</span>
        </div>
        {open && (
          <div className="pl-4 space-y-1 opacity-80 border-l border-neutral-200 dark:border-neutral-800 ml-2">
            <div className="py-0.5 hover:underline cursor-pointer">primitives/ (44)</div>
            <div className="py-0.5 hover:underline cursor-pointer">shells/ (36)</div>
            <div className="py-0.5 hover:underline cursor-pointer">sections/ (72)</div>
            <div className="py-0.5 hover:underline cursor-pointer">blocks/ (56)</div>
          </div>
        )}
      </div>
    </div>
  );
}
