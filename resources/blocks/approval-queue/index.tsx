import React, { useState } from 'react';

export type ApprovalQueueVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ApprovalQueueProps {
  variant?: ApprovalQueueVariant;
  onDecision?: (decision: 'approved' | 'rejected') => void;
}

export function ApprovalQueue({ variant = 'quiet', onDecision }: ApprovalQueueProps) {
  const [decision, setDecision] = useState<'pending' | 'approved' | 'rejected'>('pending');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let subtle = 'text-neutral-700';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    subtle = 'text-neutral-300';
  }

  const items = [
    { title: 'Publish Revision 1.0.4', submitter: 'Example reviewer', time: 'Sample item' },
  ];

  const handleDecision = (next: 'approved' | 'rejected') => {
    setDecision(next);
    onDecision?.(next);
  };

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-1">
        Pending Approvals ({decision === 'pending' ? 1 : 0})
      </h3>
      <p className={`text-xs mb-4 ${subtle}`}>Example approvals (preview only)</p>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.title} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-semibold">{it.title}</div>
              <div className={`text-xs ${subtle}`}>
                Submitted by {it.submitter} · {it.time}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {decision === 'pending' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleDecision('rejected')}
                    className={`px-3 py-1.5 rounded border font-semibold ${
                      variant === 'nocturne'
                        ? 'border-rose-400 text-rose-300'
                        : 'border-rose-700 text-rose-700'
                    }`}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision('approved')}
                    className="px-3 py-1.5 rounded bg-emerald-700 text-white font-semibold"
                  >
                    Approve
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setDecision('pending')}
                  className="px-3 py-1.5 rounded border font-semibold"
                >
                  Reset example
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {decision !== 'pending' && (
        <p role="status" className={`text-xs mt-3 ${subtle}`}>
          Example item marked {decision} locally; no workflow backend is connected.
        </p>
      )}
    </div>
  );
}
