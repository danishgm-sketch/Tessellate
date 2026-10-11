import React, { useState } from 'react';

export type AICommandBarVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AICommandBarProps {
  variant?: AICommandBarVariant;
}

export function AICommandBar({ variant = 'quiet' }: AICommandBarProps) {
  const [query, setQuery] = useState('');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white shadow-2xl'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl'
      : 'bg-white border-neutral-200 text-neutral-900 shadow-xl';

  const commands = [
    { title: 'Switch to Nocturne visual mode', category: 'Theme', shortcut: '⌘ T' },
    { title: 'Export current workspace as standalone Vite project', category: 'Export', shortcut: '⌘ E' },
    { title: 'Audit contrast against WCAG 2.2 AA', category: 'Audit', shortcut: '⌘ A' },
    { title: 'Generate Shadcn registry manifest', category: 'Registry', shortcut: '⌘ G' },
  ];

  const filtered = query
    ? commands.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    : commands;

  return (
    <div className={`w-full max-w-xl rounded-2xl border p-4 flex flex-col gap-3 transition-colors ${cardBg}`}>
      <div className="flex items-center gap-3 px-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-neutral-400">✦</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI or type an action (e.g. switch theme, export)..."
          className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-neutral-400"
          autoFocus
        />
        <kbd className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-400">
          ESC
        </kbd>
      </div>

      <div className="space-y-1">
        {filtered.map((cmd) => (
          <div
            key={cmd.title}
            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors text-xs group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                {cmd.category}
              </span>
              <span className="font-medium group-hover:text-current">{cmd.title}</span>
            </div>
            <kbd className="text-[10px] font-mono text-neutral-400">{cmd.shortcut}</kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
