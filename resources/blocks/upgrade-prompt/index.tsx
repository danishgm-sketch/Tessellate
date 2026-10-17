import React from 'react';

export type UpgradePromptVariant = 'quiet' | 'expressive' | 'nocturne';

export interface UpgradePromptProps {
  variant?: UpgradePromptVariant;
  onUpgrade?: () => void;
}

export function UpgradePrompt({ variant = 'quiet', onUpgrade }: UpgradePromptProps) {
  const noteId = React.useId();
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
          <span className="font-bold text-sm">Example upgrade prompt</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold">PLAN TEMPLATE</span>
        </div>
        <p className="text-xs opacity-75">Describe a plan and benefits your product actually provides.</p>
      </div>
      <button type="button" onClick={onUpgrade} disabled={!onUpgrade} aria-describedby={noteId} className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed">
        {onUpgrade ? 'View available plan' : 'Upgrade destination not configured'}
      </button>
      <span id={noteId} className="sr-only">{onUpgrade ? 'Opens the configured plan destination.' : 'Connect a plan destination before enabling this action.'}</span>
    </div>
  );
}
