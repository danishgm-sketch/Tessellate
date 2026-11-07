import React, { useState } from 'react';

export type AIModelModeSwitcherVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIModelModeSwitcherProps {
  variant?: AIModelModeSwitcherVariant;
}

export function AIModelModeSwitcher({ variant = 'quiet' }: AIModelModeSwitcherProps) {
  const [activeModel, setActiveModel] = useState('balanced');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
        ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
        : 'bg-white border-neutral-200 text-neutral-900';

  const models = [
    { id: 'fast', name: 'Fast', desc: 'Example mode for short, quick tasks', tag: 'Example' },
    { id: 'balanced', name: 'Balanced', desc: 'Example mode for general tasks', tag: 'Example' },
    {
      id: 'long-context',
      name: 'Long context',
      desc: 'Example mode for longer inputs',
      tag: 'Example',
    },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Example model modes</h4>
          <p className="text-xs text-neutral-500">
            Example selector. Options change this preview only; no provider or local model is
            connected.
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400">No model connected</span>
      </div>

      <div className="space-y-2.5">
        {models.map((m) => {
          const isSelected = activeModel === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveModel(m.id)}
              aria-pressed={isSelected}
              className={`w-full text-left flex items-center justify-between p-3.5 rounded-lg border text-xs transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800 ring-1 ring-current'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
              }`}
            >
              <div>
                <div className="font-semibold text-sm mb-0.5">{m.name}</div>
                <div className="text-xs text-neutral-500">{m.desc}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 font-medium">
                {m.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
