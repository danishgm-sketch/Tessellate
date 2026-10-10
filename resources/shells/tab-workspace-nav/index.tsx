import React from 'react';

export type TabWorkspaceNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TabWorkspaceNavProps {
  variant?: TabWorkspaceNavVariant;
  activeId?: string;
}

export function TabWorkspaceNav({ variant = 'quiet', activeId = '1' }: TabWorkspaceNavProps) {
  let bar = 'bg-neutral-100 border-b border-neutral-200';
  let activeTab = 'bg-white text-neutral-900 border-r border-l border-neutral-200';
  if (variant === 'nocturne') {
    bar = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';
    activeTab = 'bg-[#11141B] text-white border-r border-l border-[#2E3440]';
  }

  const tabs = [
    { id: '1', name: 'Dashboard.tsx' },
    { id: '2', name: 'tokens.css' },
    { id: '3', name: 'schema.json' },
  ];

  return (
    <div className={`w-full flex items-center h-10 px-2 overflow-x-auto text-xs ${bar}`}>
      {tabs.map((t) => (
        <div
          key={t.id}
          className={`h-full flex items-center gap-2 px-3 cursor-pointer ${
            t.id === activeId ? activeTab : 'opacity-60 hover:opacity-100'
          }`}
        >
          <span>{t.name}</span>
          <button type="button" className="opacity-40 hover:opacity-100 text-[10px]">✕</button>
        </div>
      ))}
    </div>
  );
}
