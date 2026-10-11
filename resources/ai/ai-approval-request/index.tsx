import React, { useState } from 'react';

export type AIApprovalRequestVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIApprovalRequestProps {
  variant?: AIApprovalRequestVariant;
}

export function AIApprovalRequest({ variant = 'quiet' }: AIApprovalRequestProps) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-amber-500/30 text-white'
      : variant === 'expressive'
      ? 'bg-amber-50/20 border-amber-300 text-neutral-900 shadow-sm'
      : 'bg-white border-amber-200 text-neutral-900';

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-3 border-b border-amber-200/50 dark:border-amber-900/40">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <span className="text-base">⚠</span>
          <span>Human Approval Required</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
          HIGH IMPACT
        </span>
      </div>

      <div className="space-y-2 text-xs leading-relaxed">
        <p className="font-semibold text-sm">
          Autonomous Agent requests permission to overwrite 4 design tokens in <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">tokens.css</code>
        </p>
        <p className="text-neutral-500">
          This modification alters border-hairline, canvas-bg, accent-primary, and typography scale across 24 screen layouts.
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-neutral-400 font-mono">Agent ID: agy_builder_04</span>
        <div className="flex gap-2">
          <button
            onClick={() => setStatus('rejected')}
            disabled={status !== 'pending'}
            className="px-3.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 disabled:opacity-50"
          >
            {status === 'rejected' ? 'Rejected' : 'Reject Action'}
          </button>
          <button
            onClick={() => setStatus('approved')}
            disabled={status !== 'pending'}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {status === 'approved' ? '✓ Authorized' : 'Approve & Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}
