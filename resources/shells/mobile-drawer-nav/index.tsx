import React, { useState } from 'react';

export type MobileDrawerNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MobileDrawerNavProps {
  variant?: MobileDrawerNavVariant;
}

export function MobileDrawerNav({ variant = 'quiet' }: MobileDrawerNavProps) {
  const [open, setOpen] = useState(false);

  let theme = 'bg-white text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#11141B] text-white';

  return (
    <div className="w-full p-4 flex justify-between items-center border-b">
      <span className="font-semibold text-sm">Tessellate</span>
      <button type="button" onClick={() => setOpen(true)} className="p-2 border rounded-lg text-xs">
        ☰ Menu
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className={`relative w-3/4 max-w-xs h-full p-6 space-y-6 z-10 ${theme}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">Navigation</span>
              <button type="button" onClick={() => setOpen(false)}>✕</button>
            </div>
            <nav className="space-y-3 text-sm">
              <a href="#" className="block py-1">Catalogue</a>
              <a href="#" className="block py-1">Workbench</a>
              <a href="#" className="block py-1">Design DNA</a>
              <a href="#" className="block py-1">Documentation</a>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
