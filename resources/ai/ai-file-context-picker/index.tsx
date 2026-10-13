import React, { useState } from 'react';

export type AIFileContextPickerVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIFileContextPickerProps {
  variant?: AIFileContextPickerVariant;
}

export function AIFileContextPicker({ variant = 'quiet' }: AIFileContextPickerProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    'src/tokens.css': true,
    'src/manifest.json': true,
  });

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const files = [
    { path: 'src/tokens.css', size: '2.4 KB', tokens: 620 },
    { path: 'src/manifest.json', size: '1.8 KB', tokens: 450 },
    { path: 'src/Workbench.tsx', size: '14.2 KB', tokens: 3600 },
    { path: 'docs/DESIGN_SYSTEM.md', size: '8.6 KB', tokens: 2150 },
  ];

  const toggle = (p: string) => {
    setSelected((prev) => ({ ...prev, [p]: !prev[p] }));
  };

  const totalTokens = files
    .filter((f) => selected[f.path])
    .reduce((sum, f) => sum + f.tokens, 0);

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Attach File Context</h4>
          <p className="text-xs text-neutral-500">Inject workspace files into prompt memory</p>
        </div>
        <span className="text-xs font-mono font-medium text-cyan-500">
          Selected: {totalTokens} tokens
        </span>
      </div>

      <div className="space-y-2">
        {files.map((f) => {
          const isChecked = selected[f.path] ?? false;
          return (
            <div
              key={f.path}
              onClick={() => toggle(f.path)}
              className={`flex items-center justify-between p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                isChecked
                  ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input type="checkbox" checked={isChecked} readOnly className="rounded" />
                <span className="font-mono">{f.path}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
                <span>{f.size}</span>
                <span>~{f.tokens} tok</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
