import React, { useState } from 'react';

export type CommandMenuVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CommandItem {
  id: string;
  category: string;
  label: string;
  shortcut?: string;
}

export interface CommandMenuProps {
  variant?: CommandMenuVariant;
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  onSelect?: (id: string) => void;
}

export function CommandMenu({
  variant = 'quiet',
  open,
  onClose,
  items,
  onSelect,
}: CommandMenuProps) {
  const [query, setQuery] = useState('');
  if (!open) return null;

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()) || i.category.toLowerCase().includes(query.toLowerCase()));

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-2xl';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-xs p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={`relative w-full max-w-lg rounded-xl border overflow-hidden z-10 ${theme}`}>
        <div className="flex items-center px-4 py-3 border-b border-inherit">
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="text-[10px] text-neutral-400 font-mono border rounded px-1">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-auto p-2 space-y-1">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect?.(item.id);
                onClose();
              }}
              className="flex w-full items-center justify-between rounded px-3 py-2 text-xs text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <span>{item.label}</span>
              <span className="text-[10px] opacity-40 uppercase tracking-wider font-mono">{item.category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
