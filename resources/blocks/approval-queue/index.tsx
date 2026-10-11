import React from 'react';

export type ApprovalQueueVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ApprovalQueueProps {
  variant?: ApprovalQueueVariant;
}

export function ApprovalQueue({ variant = 'quiet' }: ApprovalQueueProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const items = [
    { title: 'Publish Revision 1.0.4', submitter: 'Agent Antigravity', time: '14m ago' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Pending Approvals (1)</h3>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.title} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-semibold">{it.title}</div>
              <div className="text-[11px] opacity-60">Submitted by {it.submitter} • {it.time}</div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="px-3 py-1.5 rounded border text-rose-500 font-semibold">
                Reject
              </button>
              <button type="button" className="px-3 py-1.5 rounded bg-emerald-600 text-white font-semibold">
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
