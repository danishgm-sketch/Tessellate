import React, { useState } from 'react';

export type AIPromptHistoryVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIPromptHistoryProps {
  variant?: AIPromptHistoryVariant;
}

export function AIPromptHistory({ variant = 'quiet' }: AIPromptHistoryProps) {
  const [search, setSearch] = useState('');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const history = [
    { id: '1', prompt: 'Audit Design DNA alignment for all 56 application blocks', time: '10 mins ago', tokens: '1,420 tokens' },
    { id: '2', prompt: 'Generate 24 data visualization resources with zero runtime deps', time: '1 hour ago', tokens: '4,850 tokens' },
    { id: '3', prompt: 'Scaffold Phase 17 CLI with shadcn registry integration', time: 'Yesterday', tokens: '3,210 tokens' },
  ];

  const filtered = search ? history.filter((h) => h.prompt.toLowerCase().includes(search.toLowerCase())) : history;

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Prompt History</h4>
          <p className="text-xs text-neutral-500">Replay or inspect previous generation requests</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter prompts..."
          className="px-2.5 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group"
          >
            <div className="flex-1 pr-4">
              <div className="font-medium mb-1 group-hover:text-current">{h.prompt}</div>
              <div className="text-[11px] font-mono text-neutral-400">
                {h.time} • {h.tokens}
              </div>
            </div>
            <button className="px-3 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Replay
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
