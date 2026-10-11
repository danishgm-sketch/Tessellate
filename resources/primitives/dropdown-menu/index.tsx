import React, { useState } from 'react';

export type DropdownMenuVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  danger?: boolean;
}

export interface DropdownMenuProps {
  variant?: DropdownMenuVariant;
  trigger: React.ReactNode;
  items: MenuItem[];
  onSelect?: (id: string) => void;
}

export function DropdownMenu({ variant = 'quiet', trigger, items, onSelect }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-lg';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-xl';

  return (
    <div className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 top-full mt-1.5 z-50 min-w-48 rounded-lg border p-1 ${theme}`}>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect?.(item.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded px-3 py-1.5 text-xs text-left ${
                  item.danger ? 'text-rose-600 hover:bg-rose-50' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{item.label}</span>
                {item.shortcut && <span className="opacity-40 font-mono text-[10px]">{item.shortcut}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
