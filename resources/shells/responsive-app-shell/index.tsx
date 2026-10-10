import React from 'react';

export type ResponsiveAppShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ResponsiveAppShellProps {
  variant?: ResponsiveAppShellVariant;
  children?: React.ReactNode;
}

export function ResponsiveAppShell({
  variant = 'quiet',
  children = <div className="p-8 text-neutral-500 text-xs">Responsive viewport content</div>,
}: ResponsiveAppShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-neutral-100';

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${theme}`}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 border-r border-inherit flex-col p-4 space-y-4">
        <span className="font-semibold text-sm">Tessellate</span>
        <nav className="space-y-1 text-xs">
          <a href="#" className="block p-2 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 font-medium">Dashboard</a>
          <a href="#" className="block p-2 rounded-lg opacity-70">Analytics</a>
          <a href="#" className="block p-2 rounded-lg opacity-70">Settings</a>
        </nav>
      </aside>
      {/* Main body */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
