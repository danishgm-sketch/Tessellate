import React, { useState } from 'react';

export type SuccessCelebrationVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SuccessCelebrationProps {
  variant?: SuccessCelebrationVariant;
}

export function SuccessCelebration({ variant = 'quiet' }: SuccessCelebrationProps) {
  const [played, setPlayed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const checkColor =
    variant === 'nocturne'
      ? 'bg-emerald-500 text-black'
      : variant === 'expressive'
      ? 'bg-[#10B981] text-white shadow-lg'
      : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900';

  return (
    <div className={`w-full p-8 rounded-xl border flex flex-col items-center justify-center gap-4 transition-colors ${cardBg}`}>
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transform-none ${checkColor} ${
          played ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        ✓
      </div>

      <div className="text-center space-y-1">
        <h4 className="text-sm font-bold tracking-tight">Deployment Succeeded</h4>
        <p className="text-xs text-neutral-500">Autonomous build phase completed without errors.</p>
      </div>

      <button
        onClick={() => {
          setPlayed(false);
          setTimeout(() => setPlayed(true), 50);
        }}
        className="mt-2 text-xs px-3 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-current"
      >
        Replay Celebration
      </button>
    </div>
  );
}
