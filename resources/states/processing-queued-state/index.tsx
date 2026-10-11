import React from 'react';

export type ProcessingQueuedStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProcessingQueuedStateProps {
  queuePosition?: number;
  estimatedWait?: string;
  jobId?: string;
  variant?: ProcessingQueuedStateVariant;
  children?: React.ReactNode;
}

export function ProcessingQueuedState({
  queuePosition = 2,
  estimatedWait = '45 seconds',
  jobId = 'job_batch_8992a',
  variant = 'quiet',
  children,
}: ProcessingQueuedStateProps) {
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
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto text-center space-y-4 transition-colors ${containerBg}`}>
      <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border text-xl animate-pulse ${badgeColor}`}>
        ⏳
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight">
          Job Queued for Autonomous Processing
        </h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
          Position in queue: <span className="font-semibold text-neutral-800 dark:text-neutral-200">#{queuePosition}</span> • Estimated wait time: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{estimatedWait}</span>
        </p>
      </div>

      <div className="text-[10px] font-mono text-neutral-400">
        Job ID: {jobId}
      </div>

      {children}
    </div>
  );
}
