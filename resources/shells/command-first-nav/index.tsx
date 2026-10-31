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
    <header className={`w-full min-h-14 px-4 py-3 flex flex-wrap items-center justify-between gap-3 sm:h-14 sm:px-6 sm:py-0 sm:gap-4 ${bar}`}>
      <span className="font-semibold text-xs shrink-0">Terminal</span>
      <div className={`order-3 basis-full min-w-0 max-w-lg flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs sm:order-none sm:basis-auto sm:flex-1 ${inputTheme}`}>
        <span className="min-w-0 break-words opacity-50">Search actions, resources, commands...</span>
        <kbd className="text-[10px] opacity-40 font-mono border rounded px-1">⌘K</kbd>
      </div>
      <div className="flex items-center gap-3 text-xs shrink-0">
        <span className="opacity-60">Status: OK</span>
      </div>
    </header>
  );
}
