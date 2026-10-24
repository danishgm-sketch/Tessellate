import React from 'react';

export type ActivityFeedVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ActivityFeedProps {
  variant?: ActivityFeedVariant;
}

export function ActivityFeed({ variant = 'quiet' }: ActivityFeedProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const events = [
    { user: 'Example teammate', action: 'published a project update', time: '12m ago' },
    { user: 'Example agent', action: 'reviewed an onboarding section', time: '44m ago' },
    { user: 'Example collaborator', action: 'updated a team task', time: '2h ago' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Workspace Activity Feed</h3>
        <span className="rounded-full bg-neutral-100 px-2 py-1 font-mono text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          Sample activity
        </span>
      </div>
      <div className="space-y-4">
        {events.map((e) => (
          <div key={e.user + e.time} className="flex items-center justify-between text-xs py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0">
            <div className="flex items-center gap-3">
              <span className="h-6 w-6 rounded-full bg-neutral-300 dark:bg-neutral-700 font-bold flex items-center justify-center text-[10px]">
                {e.user.charAt(0)}
              </span>
              <span><strong>{e.user}</strong> {e.action}</span>
            </div>
            <span className="font-mono opacity-50 text-[11px]">{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
