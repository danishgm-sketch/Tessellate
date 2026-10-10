import React, { useState } from 'react';

export type CollapsibleSidebarVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CollapsibleSidebarProps {
  variant?: CollapsibleSidebarVariant;
}

export function CollapsibleSidebar({ variant = 'quiet' }: CollapsibleSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  let theme = 'bg-white border-r border-neutral-200 text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-r border-[#2E3440] text-white';

  return (
    <aside className={`h-screen transition-all duration-200 p-3 flex flex-col justify-between ${collapsed ? 'w-16' : 'w-56'} ${theme}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          {!collapsed && <span className="font-semibold text-xs">Workbench</span>}
          <button type="button" onClick={() => setCollapsed(!collapsed)} className="text-xs p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="space-y-1 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <span>◫</span>
            {!collapsed && <span>Canvas</span>}
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
            <span>⚙</span>
            {!collapsed && <span>Settings</span>}
          </div>
        </nav>
      </div>
    </aside>
  );
}
