import React from 'react';

export type VersionHistoryVariant = 'quiet' | 'expressive' | 'nocturne';

export interface VersionHistoryProps {
  variant?: VersionHistoryVariant;
}

export function VersionHistory({ variant = 'quiet' }: VersionHistoryProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const revisions = [
    { rev: 'v1.0.4', msg: 'Added 72 verified marketing sections', time: '12m ago', active: true },
    { rev: 'v1.0.3', msg: 'Stabilized 36 navigation shells', time: '4h ago', active: false },
    { rev: 'v1.0.2', msg: 'Initialized 44 primitives', time: '1d ago', active: false },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Revision History</h3>
      <div className="space-y-3 font-mono text-xs">
        {revisions.map((r) => (
          <div key={r.rev} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{r.rev}</span>
                {r.active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">CURRENT</span>}
              </div>
              <span className="text-[11px] opacity-75 font-sans">{r.msg}</span>
            </div>
            {!r.active && (
              <button type="button" className="px-2.5 py-1 rounded border text-[10px]">
                Restore
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
