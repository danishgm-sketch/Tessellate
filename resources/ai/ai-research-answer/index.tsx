import React from 'react';

export type AIResearchAnswerVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIResearchAnswerProps {
  variant?: AIResearchAnswerVariant;
}

export function AIResearchAnswer({ variant = 'quiet' }: AIResearchAnswerProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
        ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
        : 'bg-white border-neutral-200 text-neutral-900';

  const calloutBg =
    variant === 'nocturne'
      ? 'bg-cyan-950/40 border-cyan-800 text-cyan-200'
      : variant === 'expressive'
        ? 'bg-blue-50 border-blue-200 text-blue-900'
        : 'bg-neutral-50 border-neutral-200 text-neutral-900';

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Example research answer</h4>
          <p className="text-xs text-neutral-500">
            Example research answer. No sources were retrieved and no confidence score was
            calculated.
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
          Example
        </span>
      </div>

      <div className={`p-4 rounded-lg border text-xs leading-relaxed ${calloutBg}`}>
        <span className="font-bold uppercase tracking-wider block mb-1 text-[10px]">
          Executive Summary
        </span>
        A team comparing a monolithic application with independently deployed modules can weigh
        ownership, deployment needs, integration work, and operational complexity.
      </div>

      <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
        <div className="flex items-start gap-2">
          <span className="font-mono text-neutral-400 font-bold">1.</span>
          <span>A monolith can keep shared changes and deployments within one codebase.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-mono text-neutral-400 font-bold">2.</span>
          <span>
            Independent modules can support separate ownership when team boundaries are stable.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-mono text-neutral-400 font-bold">3.</span>
          <span>
            The better fit depends on team structure, deployment needs, and operational overhead.
          </span>
        </div>
      </div>
    </div>
  );
}
