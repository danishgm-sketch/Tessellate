import React, { useState } from 'react';

export type AIModelModeSwitcherVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIModelModeSwitcherProps {
  variant?: AIModelModeSwitcherVariant;
}

export function AIModelModeSwitcher({ variant = 'quiet' }: AIModelModeSwitcherProps) {
  const [activeModel, setActiveModel] = useState('claude-3-7-sonnet');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const models = [
    { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', desc: 'Hybrid reasoning + coding', tag: 'Recommended' },
    { id: 'gpt-4o', name: 'GPT-4o', desc: 'High-speed multimodal generation', tag: 'Fast' },
    { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro', desc: '2M context window for large repos', tag: 'Large Context' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Model & Endpoint Configuration</h4>
          <p className="text-xs text-neutral-500">Configure BYO provider credentials or local inference</p>
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400">BYO Key Active</span>
      </div>

      <div className="space-y-2.5">
        {models.map((m) => {
          const isSelected = activeModel === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setActiveModel(m.id)}
              className={`flex items-center justify-between p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
