import React from 'react';

export type CommandFirstNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CommandFirstNavProps {
  variant?: CommandFirstNavVariant;
}

export function CommandFirstNav({ variant = 'quiet' }: CommandFirstNavProps) {
  let bar = 'bg-white border-b border-neutral-200 text-neutral-900';
  let inputTheme = 'bg-neutral-100 border-neutral-200';
  if (variant === 'nocturne') {
    bar = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';
    inputTheme = 'bg-[#11141B] border-[#2E3440] text-white';
  }

  return (
    <header className={`w-full px-6 h-14 flex items-center justify-between gap-4 ${bar}`}>
      <span className="font-semibold text-xs shrink-0">Terminal</span>
      <div className={`flex-1 max-w-lg flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs ${inputTheme}`}>
        <span className="opacity-50">Search actions, resources, commands...</span>
        <kbd className="text-[10px] opacity-40 font-mono border rounded px-1">⌘K</kbd>
      </div>
      <div className="flex items-center gap-3 text-xs shrink-0">
        <span className="opacity-60">Status: OK</span>
      </div>
    </header>
  );
}
