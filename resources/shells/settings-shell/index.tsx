import React, { useId, useState } from 'react';

export type SettingsShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SettingsShellProps {
  variant?: SettingsShellVariant;
}

export function SettingsShell({ variant = 'quiet' }: SettingsShellProps) {
  const workspaceNameId = useId();
  const [workspaceName, setWorkspaceName] = useState('Tessellate Lab');

  let theme = 'bg-[#FAF9F6] text-neutral-900';
  let panel = 'bg-white text-neutral-900 border-neutral-200';
  let inputClass = 'border-neutral-300 bg-white text-neutral-900';
  if (variant === 'nocturne') {
    theme = 'bg-[#0B0D10] text-white';
    panel = 'bg-[#11141B] text-white border-[#2E3440]';
    inputClass = 'border-[#2E3440] bg-[#151921] text-white';
  }

  return (
    <div className={`min-h-screen p-8 max-w-4xl mx-auto space-y-6 ${theme}`}>
      <header className="pb-4 border-b">
        <h1 className="text-lg font-bold">Workspace Settings</h1>
        <p className="text-xs opacity-80">Example workspace settings layout — changes stay local to this preview.</p>
      </header>
      <div className="flex flex-col sm:flex-row gap-8 text-xs">
        <aside className="w-full sm:w-48 space-y-1">
          <p className="p-2 rounded font-semibold bg-neutral-200/50 dark:bg-neutral-800">General</p>
          <p className="p-2 rounded opacity-75">Design DNA</p>
          <p className="p-2 rounded opacity-75">Team Members</p>
          <p className="p-2 rounded opacity-75">Billing</p>
        </aside>
        <main className={`flex-1 border p-6 rounded-xl space-y-4 ${panel}`}>
          <h2 className="font-semibold text-sm">Project Profile</h2>
          <div className="space-y-1">
            <label htmlFor={workspaceNameId} className="block text-xs font-medium opacity-85">
              Workspace Name
            </label>
            <input
              id={workspaceNameId}
              type="text"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              className={`w-full border p-2 rounded text-xs focus-visible:ring-2 focus-visible:ring-[#2547E8] focus-visible:outline-none ${inputClass}`}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
