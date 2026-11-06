import React from 'react';

export type CommandCentreShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CommandCentreShellProps {
  variant?: CommandCentreShellVariant;
  children?: React.ReactNode;
}

export function CommandCentreShell({
  variant = 'quiet',
  children = <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="border p-4 rounded-xl">Example node A</div><div className="border p-4 rounded-xl">Example node B</div><div className="border p-4 rounded-xl">Example node C</div></div>,
}: CommandCentreShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-neutral-100';

  return (
    <div className={`min-h-screen p-6 space-y-6 ${theme}`}>
      <header className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-base font-bold">Mission Control</h1>
          <p className="text-xs opacity-60">Example telemetry layout</p>
        </div>
        <div className="flex gap-2">
          <span className="px-2.5 py-1 bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 rounded text-xs font-mono font-bold">Sample status · not live</span>
        </div>
      </header>
      <main className="text-xs">{children}</main>
    </div>
  );
}
