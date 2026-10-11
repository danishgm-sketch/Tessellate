import React from 'react';

export type FirstRunStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FirstRunStateProps {
  onGetStarted?: () => void;
  variant?: FirstRunStateVariant;
  children?: React.ReactNode;
}

export function FirstRunState({ onGetStarted, variant = 'quiet', children }: FirstRunStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800'
      : variant === 'expressive'
      ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
      : 'text-neutral-700 bg-neutral-100 border-neutral-200';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-6 transition-colors ${containerBg}`}>
      <div className="flex items-center gap-3">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-lg ${badgeColor}`}>
          ✨
        </span>
        <div>
          <h3 className="text-xl font-bold tracking-tight">Welcome to Tessellate Workbench</h3>
          <p className="text-xs text-neutral-500">Autonomous interface composition with zero vendor lock-in</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-lg border border-neutral-200/20 space-y-1">
          <span className="text-[10px] font-mono text-neutral-400 font-bold">STEP 01</span>
          <h4 className="text-sm font-semibold">Select Design DNA</h4>
          <p className="text-xs text-neutral-500">Calibrate 30 visual tokens from Quiet to Expressive and Nocturne.</p>
        </div>
        <div className="p-4 rounded-lg border border-neutral-200/20 space-y-1">
          <span className="text-[10px] font-mono text-neutral-400 font-bold">STEP 02</span>
          <h4 className="text-sm font-semibold">Compose Manifest</h4>
          <p className="text-xs text-neutral-500">Assemble validated screens from 324 open resource components.</p>
        </div>
        <div className="p-4 rounded-lg border border-neutral-200/20 space-y-1">
          <span className="text-[10px] font-mono text-neutral-400 font-bold">STEP 03</span>
          <h4 className="text-sm font-semibold">Export Clean Code</h4>
          <p className="text-xs text-neutral-500">Download production React + Tailwind TypeScript source code.</p>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onGetStarted}
          className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
        >
          Begin Composition Tour
        </button>
      </div>

      {children}
    </div>
  );
}
