import React, { useState } from 'react';

export type AppSidebarCompactVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AppSidebarCompactProps {
  variant?: AppSidebarCompactVariant;
  activeId?: string;
  defaultActiveId?: string;
  onSelectItem?: (id: string) => void;
}

export function AppSidebarCompact({
  variant = 'quiet',
  activeId,
  defaultActiveId = 'home',
  onSelectItem,
}: AppSidebarCompactProps) {
  const [uncontrolledId, setUncontrolledId] = useState(defaultActiveId);
  const selectedId = activeId ?? uncontrolledId;

  let theme = 'bg-white border-r border-neutral-200 text-neutral-800';
  let active = 'bg-neutral-100 text-neutral-900';
  if (variant === 'expressive') {
    theme = 'bg-white border-r border-[#D9D6CF] text-neutral-800';
    active = 'bg-[#E7EBFF] text-[#2547E8] font-bold';
  } else if (variant === 'nocturne') {
    theme = 'bg-[#11141B] border-r border-[#2E3440] text-neutral-300';
    active = 'bg-[#1E232E] text-white';
  }

  const items = [
    { id: 'home', label: 'Home', icon: '⌘' },
    { id: 'layers', label: 'Layers', icon: '◫' },
    { id: 'dna', label: 'Design DNA', icon: '🧬' },
    { id: 'export', label: 'Export', icon: '⇪' },
  ];

  return (
    <aside aria-label="Compact navigation" className={`w-14 h-screen flex flex-col items-center py-4 gap-4 ${theme}`}>
      <div className="h-8 w-8 rounded-lg bg-current opacity-20 flex items-center justify-center font-bold text-xs" aria-hidden="true" />
      <nav aria-label="Compact workspace links" className="flex-1 flex flex-col gap-2 w-full px-2">
        {items.map((it) => {
          const isCurrent = it.id === selectedId;
          return (
            <button
              key={it.id}
              type="button"
              aria-label={it.label}
              title={it.label}
              aria-current={isCurrent ? 'page' : undefined}
              onClick={() => {
                if (activeId === undefined) {
                  setUncontrolledId(it.id);
                }
                onSelectItem?.(it.id);
              }}
              className={`h-10 w-full rounded-lg flex items-center justify-center text-sm transition-colors ${
                isCurrent ? active : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
              }`}
            >
              <span aria-hidden="true">{it.icon}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
