import React, { useState } from 'react';

export type AIAgentActivityFeedVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIAgentActivityFeedProps {
  variant?: AIAgentActivityFeedVariant;
}

export function AIAgentActivityFeed({ variant = 'quiet' }: AIAgentActivityFeedProps) {
  const [filter, setFilter] = useState<'all' | 'milestones'>('all');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const events = [
    { time: '09:14', agent: 'Catalog review', action: 'Checked sample UI resources for duplicate patterns', type: 'info' },
    { time: '09:16', agent: 'Accessibility review', action: 'Reviewed keyboard flow for a sample onboarding screen', type: 'milestone' },
    { time: '09:18', agent: 'Component review', action: 'Compared responsive behavior across dashboard examples', type: 'milestone' },
    { time: '09:20', agent: 'Release review', action: 'Prepared a review summary for a person to verify', type: 'info' },
  ];

  const displayed = filter === 'milestones' ? events.filter((e) => e.type === 'milestone') : events;

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Example agent activity</h2>
        </div>
        <span className="rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">Static sample data</span>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded font-mono ${filter === 'all' ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold' : 'text-neutral-400'}`}
          >
            All Events
          </button>
          <button
            type="button"
            onClick={() => setFilter('milestones')}
            className={`px-2.5 py-1 rounded font-mono ${filter === 'milestones' ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold' : 'text-neutral-400'}`}
          >
            Milestones
          </button>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {displayed.map((e, idx) => (
          <div key={idx} className="flex flex-wrap items-start gap-2 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
            <span className="shrink-0 text-[11px] text-neutral-400 select-none">{e.time}</span>
            <span className="max-w-full break-words px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {e.agent}
            </span>
            <span className="basis-full min-w-0 flex-1 break-words text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans text-xs sm:basis-auto">
              {e.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
