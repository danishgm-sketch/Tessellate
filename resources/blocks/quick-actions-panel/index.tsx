import React, { useState } from 'react';

export type QuickActionsPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface QuickActionsPanelProps {
  variant?: QuickActionsPanelVariant;
  onTriggerAction?: (label: string) => void;
}

export function QuickActionsPanel({
  variant = 'quiet',
  onTriggerAction,
}: QuickActionsPanelProps) {
  const [lastAction, setLastAction] = useState<string | null>(null);

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let btn = 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800';
  let statusColor = 'text-neutral-700';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    btn = 'bg-white hover:border-[#2547E8] border-neutral-200 text-neutral-900 shadow-2xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    btn = 'bg-[#151921] hover:border-cyan-400 border-[#2E3440] text-neutral-200';
    statusColor = 'text-neutral-200';
  }

  const actions = [
    { label: 'New Project', icon: '+' },
    { label: 'Import Schema', icon: '↓' },
    { label: 'Run DNA Audit', icon: '⚡' },
    { label: 'Export Code', icon: '↗' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => {
              setLastAction(a.label);
              onTriggerAction?.(a.label);
            }}
            className={`p-4 rounded-lg border flex flex-col items-center justify-center text-center transition-all ${btn}`}
          >
            <span className="text-base font-bold mb-1" aria-hidden="true">{a.icon}</span>
            <span className="text-xs font-semibold">{a.label}</span>
          </button>
        ))}
      </div>
      {lastAction && (
        <p role="status" className={`text-xs mt-3 ${statusColor}`}>
          Preview only: &ldquo;{lastAction}&rdquo; selected locally; connect a host handler to run this command.
        </p>
      )}
    </div>
  );
}
