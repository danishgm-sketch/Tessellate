import React, { useState } from 'react';

export type VersionHistoryVariant = 'quiet' | 'expressive' | 'nocturne';

export interface VersionHistoryProps {
  variant?: VersionHistoryVariant;
}

export function VersionHistory({ variant = 'quiet' }: VersionHistoryProps) {
  const [previewedRevision, setPreviewedRevision] = useState<string | null>(null);
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const revisions = [
    { rev: 'v1.0.4', msg: 'Updated dashboard layout', time: 'Today', active: true },
    { rev: 'v1.0.3', msg: 'Added a resource filter', time: 'Yesterday', active: false },
    { rev: 'v1.0.2', msg: 'Adjusted page spacing', time: 'Earlier', active: false },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Revision History</h3>
      <p className="text-xs text-neutral-500 mb-4">Example revision history. Restoring here does not change a project.</p>
      <div className="space-y-3 font-mono text-xs">
        {revisions.map((r) => (
          <div key={r.rev} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{r.rev}</span>
                {r.active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">CURRENT EXAMPLE</span>}
              </div>
              <span className="text-[11px] opacity-75 font-sans">{r.msg}</span>
            </div>
            {!r.active && (
              <button
                type="button"
                aria-label={`Preview restore for ${r.rev}`}
                onClick={() => setPreviewedRevision(r.rev)}
                className="px-2.5 py-1 rounded border text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Preview restore
              </button>
            )}
          </div>
        ))}
      </div>
      {previewedRevision && (
        <p role="status" className="mt-4 text-xs text-neutral-500" aria-live="polite">
          Restore preview for {previewedRevision}. No project revision was changed.
        </p>
      )}
    </div>
  );
}
