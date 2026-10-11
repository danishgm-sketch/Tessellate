import React from 'react';

export type CommandCentreShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CommandCentreShellProps {
  variant?: CommandCentreShellVariant;
  children?: React.ReactNode;
}

export function CommandCentreShell({
  variant = 'quiet',
  children = <div className="grid grid-cols-3 gap-4"><div className="border p-4 rounded-xl">Node A</div><div className="border p-4 rounded-xl">Node B</div><div className="border p-4 rounded-xl">Node C</div></div>,
}: CommandCentreShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-neutral-100';

  return (
    <div className={`min-h-screen p-6 space-y-6 ${theme}`}>
      <header className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-base font-bold">Mission Control</h1>
          <p className="text-xs opacity-60">Global Cluster Telemetry</p>
        </div>
        <div className="flex gap-2">
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-500 rounded text-xs font-mono font-bold">ALL SYSTEMS OPERATIONAL</span>
        </div>
      </header>
      <main className="text-xs">{children}</main>
    </div>
  );
}
