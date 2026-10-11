import React from 'react';

export type ResearchTerminalShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ResearchTerminalShellProps {
  variant?: ResearchTerminalShellVariant;
}

export function ResearchTerminalShell({ variant = 'quiet' }: ResearchTerminalShellProps) {
  let theme = 'bg-white text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={`h-screen flex divide-x text-xs ${theme}`}>
      <div className="w-64 p-4 space-y-3">
        <span className="font-bold">Paper Index</span>
        <p className="p-2 border rounded font-medium">Attention Is All You Need</p>
        <p className="p-2 border rounded opacity-70">Deep Residual Learning</p>
      </div>
      <div className="flex-1 p-6 space-y-4">
        <h2 className="text-base font-semibold">Abstract & Empirical Results</h2>
        <p className="text-neutral-500 leading-relaxed">Evaluation metrics across multimodal benchmarks.</p>
      </div>
    </div>
  );
}
