import React from 'react';

export type AdminConsoleShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AdminConsoleShellProps {
  variant?: AdminConsoleShellVariant;
}

export function AdminConsoleShell({ variant = 'quiet' }: AdminConsoleShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={`min-h-screen p-8 space-y-6 ${theme}`}>
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-base font-bold">Admin Console</h1>
          <p className="text-xs opacity-60">User permissions & security enforcement</p>
        </div>
        <button className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-lg text-xs font-medium">Invite User</button>
      </div>
      <div className="border rounded-xl p-4 bg-white dark:bg-neutral-900 text-xs">
        <p className="font-semibold mb-2">Active Organization Members (14)</p>
        <p className="opacity-60">All members authenticated with GitHub OAuth.</p>
      </div>
    </div>
  );
}
