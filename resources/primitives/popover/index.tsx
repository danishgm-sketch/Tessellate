import React, { useState } from 'react';

export type PopoverVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PopoverProps {
  variant?: PopoverVariant;
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function Popover({ variant = 'quiet', trigger, children }: PopoverProps) {
  const [open, setOpen] = useState(false);

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-xl';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';

  return (
    <div className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute top-full left-0 mt-2 z-50 min-w-64 rounded-xl border p-4 ${theme}`}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}
