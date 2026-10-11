import React, { useState } from 'react';

export type AIPlanReviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIPlanReviewProps {
  variant?: AIPlanReviewVariant;
}

export function AIPlanReview({ variant = 'quiet' }: AIPlanReviewProps) {
  const [accepted, setAccepted] = useState(false);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const steps = [
    { num: '01', title: 'Generate Manifest Contracts', desc: 'Create 20 validated ResourceManifest JSON schemas with 0 dependencies.' },
    { num: '02', title: 'Synthesize React Components', desc: 'Author clean, accessible pure SVG + Tailwind components for all 3 variants.' },
    { num: '03', title: 'Monorepo Typecheck & Lint Gate', desc: 'Run pnpm typecheck and pnpm lint to verify 0 errors and 0 warnings.' },
    { num: '04', title: 'Test Suite & Phase Gate Commit', desc: 'Execute 253 tests across packages and commit with conventional commit message.' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-5 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Proposed Implementation Plan</h4>
          <p className="text-xs text-neutral-500">Autonomous execution strategy for Phase 18</p>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
          4 Steps | ~2m runtime
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((s) => (
          <div key={s.num} className="flex items-start gap-4 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-mono font-bold text-neutral-400 mt-0.5">{s.num}</span>
            <div className="flex-1">
              <h5 className="text-xs font-semibold mb-0.5">{s.title}</h5>
              <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => setAccepted(!accepted)}
          className="px-5 py-2 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
        >
          {accepted ? '✓ Plan Accepted & Running' : 'Accept Plan & Proceed'}
        </button>
      </div>
    </div>
  );
}
