import React from 'react';

export type SettingsShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SettingsShellProps {
  variant?: SettingsShellVariant;
}

export function SettingsShell({ variant = 'quiet' }: SettingsShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={`min-h-screen p-8 max-w-4xl mx-auto space-y-6 ${theme}`}>
      <header className="pb-4 border-b">
        <h1 className="text-lg font-bold">Workspace Settings</h1>
        <p className="text-xs opacity-60">Manage your project defaults and developer credentials.</p>
      </header>
      <div className="flex gap-8 text-xs">
        <aside className="w-48 space-y-1">
          <p className="p-2 rounded font-semibold bg-neutral-200/50 dark:bg-neutral-800">General</p>
          <p className="p-2 rounded opacity-70">Design DNA</p>
          <p className="p-2 rounded opacity-70">Team Members</p>
          <p className="p-2 rounded opacity-70">Billing</p>
        </aside>
        <main className="flex-1 border p-6 rounded-xl bg-white dark:bg-neutral-900 space-y-4">
          <h2 className="font-semibold text-sm">Project Profile</h2>
          <div className="space-y-1">
            <label className="text-[11px] font-medium opacity-70">Workspace Name</label>
            <input type="text" defaultValue="Tessellate Lab" className="w-full border p-2 rounded text-xs" />
          </div>
        </main>
      </div>
    </div>
  );
}
