import React from 'react';

export type KioskDisplayShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface KioskDisplayShellProps {
  variant?: KioskDisplayShellVariant;
}

export function KioskDisplayShell({ variant = 'quiet' }: KioskDisplayShellProps) {
  let theme = 'bg-white text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={`w-full h-screen p-12 flex flex-col justify-between select-none ${theme}`}>
      <header className="flex justify-between items-center pb-6 border-b">
        <span className="text-xl font-bold">Example signage interface</span>
        <span className="text-sm font-mono opacity-50">Example screen</span>
      </header>
      <main className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome to the event</h2>
        <p className="text-sm opacity-60">Sample message for a public display.</p>
      </main>
      <footer className="text-center text-xs opacity-40">
        Preview only — no inactivity timer is running.
      </footer>
    </div>
  );
}
