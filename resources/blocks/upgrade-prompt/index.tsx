import React from 'react';

export type UpgradePromptVariant = 'quiet' | 'expressive' | 'nocturne';

export interface UpgradePromptProps {
  variant?: UpgradePromptVariant;
}

export function UpgradePrompt({ variant = 'quiet' }: UpgradePromptProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-r from-blue-50/60 to-purple-50/40 text-neutral-950 border-blue-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#151921] text-white border-cyan-500/30';
  }

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${bg}`}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-sm">Unlock Cloud Team Checkpoints</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold">TEAM PRO</span>
        </div>
        <p className="text-xs opacity-75">Sync projects across devices and collaborate with unlimited teammates.</p>
      </div>
      <button type="button" className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold whitespace-nowrap">
        Upgrade Now →
      </button>
    </div>
  );
}
