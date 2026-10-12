import React, { useState } from 'react';

export type AISuggestedActionsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AISuggestedActionsProps {
  variant?: AISuggestedActionsVariant;
}

export function AISuggestedActions({ variant = 'quiet' }: AISuggestedActionsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const actionPill =
    variant === 'nocturne'
      ? 'bg-[#151921] hover:bg-[#1E232E] border-[#2E3440] text-cyan-400'
      : variant === 'expressive'
      ? 'bg-blue-50/70 hover:bg-blue-100/70 border-blue-200 text-blue-900'
      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200';

  const actions = [
    { id: '1', title: 'Export as Vite App', desc: 'Bundle React + Tailwind 4 source tree' },
    { id: '2', title: 'Run Contrast Audit', desc: 'Validate WCAG 2.2 AA against 3 presets' },
    { id: '3', title: 'Generate Shadcn Manifest', desc: 'Create registry schema item file' },
  ];

  return (
    <div className={`w-full p-5 rounded-[var(--tess-radius-xl,8px)] border flex flex-col gap-3 transition-colors ${cardBg}`}>
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="text-amber-500">✦</span>
        <span>Suggested Next Steps</span>
      </div>

      <div className="grid grid-cols-1 @sm:grid-cols-3 gap-2.5">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => setSelected(act.id)}
            className={`p-3 rounded-[var(--tess-radius-lg,8px)] border text-left transition-all ${actionPill} ${
              selected === act.id ? 'ring-2 ring-current' : ''
            }`}
          >
            <div className="text-xs font-semibold mb-1">{act.title}</div>
            <div className="text-[11px] text-[var(--tess-ink-muted,#62666F)] leading-snug">{act.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
