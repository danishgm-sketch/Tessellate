import React, { useState } from 'react';

export type AIMemoryContextPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIMemoryContextPanelProps {
  variant?: AIMemoryContextPanelVariant;
}

export function AIMemoryContextPanel({ variant = 'quiet' }: AIMemoryContextPanelProps) {
  const [memories, setMemories] = useState([
    { key: 'preferred_mode', val: 'Nocturne (dark obsidian canvas)' },
    { key: 'stack_target', val: 'React 19 + Tailwind CSS 4' },
    { key: 'dependency_rule', val: '0 undeclared dependencies allowed' },
  ]);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const removeMem = (k: string) => {
    setMemories(memories.filter((m) => m.key !== k));
  };

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Active Assistant Memory</h4>
          <p className="text-xs text-neutral-500">Short & long-term conversational recall</p>
        </div>
        <button
          onClick={() => setMemories([])}
          className="text-xs text-rose-500 hover:underline font-mono"
        >
          Purge All
        </button>
      </div>

      <div className="space-y-2">
        {memories.map((m) => (
          <div
            key={m.key}
            className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
          >
            <div>
              <span className="text-neutral-400 mr-2">{m.key}:</span>
              <span className="font-semibold">{m.val}</span>
            </div>
            <button onClick={() => removeMem(m.key)} className="text-neutral-400 hover:text-rose-500 px-1">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
