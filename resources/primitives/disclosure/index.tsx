import React, { useState } from 'react';

export type DisclosureVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DisclosureProps {
  variant?: DisclosureVariant;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Disclosure({ variant = 'quiet', title, children, defaultOpen = false }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);

  let theme = 'border-neutral-200 dark:border-neutral-800';
  if (variant === 'expressive') theme = 'border-[#D9D6CF]';
  if (variant === 'nocturne') theme = 'border-[#2E3440] bg-[#11141B] text-white';

  return (
    <div className={`w-full rounded-lg border p-3 text-sm ${theme}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between font-medium text-left text-xs"
      >
        <span>{title}</span>
        <span className="text-neutral-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">{children}</div>}
    </div>
  );
}
