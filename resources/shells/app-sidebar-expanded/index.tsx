import React from 'react';

export type AppSidebarExpandedVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AppSidebarExpandedProps {
  variant?: AppSidebarExpandedVariant;
}

export function AppSidebarExpanded({ variant = 'quiet' }: AppSidebarExpandedProps) {
  let theme = 'bg-white border-r border-neutral-200 text-neutral-900';
  let active = 'bg-neutral-100 font-semibold';
  if (variant === 'expressive') {
    theme = 'bg-white border-r border-[#D9D6CF] text-neutral-900';
    active = 'bg-[#E7EBFF] text-[#2547E8] font-semibold';
  } else if (variant === 'nocturne') {
    theme = 'bg-[#11141B] border-r border-[#2E3440] text-white';
    active = 'bg-[#1E232E] text-white font-semibold';
  }

  return (
    <aside className={`w-60 h-screen flex flex-col p-4 gap-6 text-xs ${theme}`}>
      <div className="font-semibold text-sm px-2">Tessellate Console</div>
      <div className="space-y-4 flex-1">
        <div className="space-y-1">
          <p className="px-2 text-[10px] uppercase font-bold text-neutral-400">Workspace</p>
          <a href="#" className={`block px-2.5 py-1.5 rounded-lg ${active}`}>Dashboard</a>
          <a href="#" className="block px-2.5 py-1.5 rounded-lg opacity-70 hover:opacity-100">Telemetry</a>
          <a href="#" className="block px-2.5 py-1.5 rounded-lg opacity-70 hover:opacity-100">Composition Engine</a>
        </div>
        <div className="space-y-1">
          <p className="px-2 text-[10px] uppercase font-bold text-neutral-400">Settings</p>
          <a href="#" className="block px-2.5 py-1.5 rounded-lg opacity-70 hover:opacity-100">Design DNA</a>
          <a href="#" className="block px-2.5 py-1.5 rounded-lg opacity-70 hover:opacity-100">API Tokens</a>
        </div>
      </div>
    </aside>
  );
}
