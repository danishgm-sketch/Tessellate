import React, { useState } from 'react';

export type InlineAIRewriteVariant = 'quiet' | 'expressive' | 'nocturne';

export interface InlineAIRewriteProps {
  variant?: InlineAIRewriteVariant;
}

export function InlineAIRewrite({ variant = 'quiet' }: InlineAIRewriteProps) {
  const [tone, setTone] = useState<'concise' | 'professional' | 'energetic'>('concise');
  const [status, setStatus] = useState<'idle' | 'reviewed'>('reviewed');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const tones = ['concise', 'professional', 'energetic'] as const;

  const originalText = 'We have built a platform that enables teams to construct web applications quickly.';
  const rewrittenTexts = {
    concise: 'Tessellate accelerates interface construction through validated semantic resources.',
    professional: 'Tessellate equips engineering organizations with a deterministic system for composing high-fidelity software.',
    energetic: 'Ship stunning, production-ready interfaces instantly with Tessellate’s open resource vocabulary!',
  };

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-xs font-semibold">Inline AI Rewrite</span>
          <span className="text-[10px] font-mono text-neutral-400">Ctrl + Shift + R</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tones.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`text-[11px] px-2.5 py-1 rounded-md capitalize transition-colors ${
                tone === t
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-xs">
          <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-1">Original</span>
          <span className="line-through text-neutral-500">{originalText}</span>
        </div>

        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <span className="text-[10px] uppercase font-mono text-emerald-600 dark:text-emerald-400 font-bold block mb-1">Rewritten ({tone})</span>
          <span className="font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed">
            {rewrittenTexts[tone]}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={() => setStatus('idle')}
          className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100"
        >
          Discard
        </button>
        <button
          onClick={() => setStatus('reviewed')}
          className="px-4 py-1.5 text-xs rounded-lg font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
        >
          {status === 'reviewed' ? '✓ Accepted' : 'Accept Rewrite'}
        </button>
      </div>
    </div>
  );
}
