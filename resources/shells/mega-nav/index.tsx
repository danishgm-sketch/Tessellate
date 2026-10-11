import React, { useState } from 'react';

export type MegaNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MegaNavProps {
  variant?: MegaNavVariant;
}

export function MegaNav({ variant = 'quiet' }: MegaNavProps) {
  const [open, setOpen] = useState(false);

  let bar = 'bg-white border-b border-neutral-200 text-neutral-900';
  let menu = 'bg-white border-[#D9D6CF] shadow-2xl';
  if (variant === 'nocturne') {
    bar = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';
    menu = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';
  }

  return (
    <div className={`w-full relative ${bar}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-semibold text-sm">Tessellate Suite</span>
        <div className="flex items-center gap-6 text-xs">
          <button type="button" onClick={() => setOpen(!open)} className="font-medium flex items-center gap-1">
            Products ▾
          </button>
          <a href="#" className="opacity-70 hover:opacity-100">Enterprise</a>
          <a href="#" className="opacity-70 hover:opacity-100">Docs</a>
        </div>
        <button className="px-3 py-1.5 text-xs bg-neutral-900 text-white rounded-lg">Launch</button>
      </div>
      {open && (
        <div className={`absolute top-full left-0 w-full border-b p-8 z-40 ${menu}`}>
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8 text-xs">
            <div className="space-y-2">
              <p className="font-semibold uppercase tracking-wider opacity-50">Composition Engine</p>
              <p className="text-neutral-500">Deterministic Zod layout mutation pipeline.</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold uppercase tracking-wider opacity-50">Design DNA</p>
              <p className="text-neutral-500">10-dimensional mathematical aesthetic control.</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold uppercase tracking-wider opacity-50">Workbench</p>
              <p className="text-neutral-500">Dual-layer visual and structural editor.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
