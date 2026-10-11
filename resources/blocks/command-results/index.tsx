import React from 'react';

export type CommandResultsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CommandResultsProps {
  variant?: CommandResultsVariant;
}

export function CommandResults({ variant = 'quiet' }: CommandResultsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const commands = [
    { name: 'Export Code as TSX', shortcut: '⌘E' },
    { name: 'Mutate Design DNA Tokens', shortcut: '⌘D' },
    { name: 'Toggle Nocturne Theme', shortcut: '⌘T' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Command Actions</h3>
      <div className="space-y-2">
        {commands.map((c) => (
          <div key={c.name} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
            <span className="font-medium">{c.name}</span>
            <kbd className="px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 font-mono text-[10px]">
              {c.shortcut}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
