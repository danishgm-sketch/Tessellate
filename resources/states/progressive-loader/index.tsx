import React from 'react';

export type ProgressiveLoaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProgressiveLoaderProps {
  progress?: number;
  currentStep?: string;
  totalSteps?: number;
  stepNumber?: number;
  variant?: ProgressiveLoaderVariant;
  children?: React.ReactNode;
}

export function ProgressiveLoader({
  progress = 68,
  currentStep = 'Synthesizing React component tree and semantic tokens...',
  totalSteps = 4,
  stepNumber = 3,
  variant = 'quiet',
  children,
}: ProgressiveLoaderProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const barColor =
    variant === 'nocturne'
      ? 'bg-cyan-400'
      : variant === 'expressive'
      ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
      : 'bg-neutral-900 dark:bg-white';

  return (
    <div className={`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto space-y-4 transition-colors ${containerBg}`}>
      <div className="flex justify-between items-center text-xs">
        <span className="font-mono text-neutral-400 uppercase tracking-wider">
          Stage {stepNumber} of {totalSteps}
        </span>
        <span className="font-mono font-bold text-neutral-700 dark:text-neutral-200">
          {progress}%
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-neutral-500 font-mono flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {currentStep}
      </p>
      {children}
    </div>
  );
}
