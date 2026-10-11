import React from 'react';

export type AppSidebarCompactVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AppSidebarCompactProps {
  variant?: AppSidebarCompactVariant;
  activeId?: string;
}

export function AppSidebarCompact({ variant = 'quiet', activeId = 'home' }: AppSidebarCompactProps) {
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
    { id: 'home', icon: '⌘' },
    { id: 'layers', icon: '◫' },
    { id: 'dna', icon: '🧬' },
    { id: 'export', icon: '⇪' },
  ];

  return (
    <aside className={`w-14 h-screen flex flex-col items-center py-4 gap-4 ${theme}`}>
      <div className="h-8 w-8 rounded-lg bg-current opacity-20 flex items-center justify-center font-bold text-xs" />
      <div className="flex-1 flex flex-col gap-2 w-full px-2">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`h-10 w-full rounded-lg flex items-center justify-center text-sm transition-colors ${
              it.id === activeId ? active : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
            }`}
          >
            {it.icon}
          </button>
        ))}
      </div>
    </aside>
  );
}
