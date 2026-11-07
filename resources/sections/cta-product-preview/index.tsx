import React from 'react';

export type CtaProductPreviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaProductPreviewProps {
  variant?: CtaProductPreviewVariant;
  composeHref?: string;
}

export function CtaProductPreview({ variant = 'quiet', composeHref }: CtaProductPreviewProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let box = 'bg-white border-neutral-200 shadow-md';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-white to-blue-50/50 text-neutral-950 border-[#D9D6CF]';
    box = 'bg-white border-blue-200 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    box = 'bg-[#151921] border-[#2E3440] shadow-2xl';
  }

  return (
    <section
      className={`relative w-full py-20 px-6 sm:px-12 border-b overflow-hidden transition-colors ${bg}`}
    >
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">See how your product could look</h2>
        <p className="text-xs sm:text-sm opacity-75 max-w-md mb-8">
          Start with a brief and compare three interface directions.
        </p>
        {composeHref ? (
          <a
            href={composeHref}
            className="px-6 py-3 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider mb-12"
          >
            Start composing
          </a>
        ) : (
          <p role="status" className="text-xs opacity-75 mb-12">
            Set composeHref to connect this action.
          </p>
        )}

        <div
          className={`w-full min-h-44 rounded-t-2xl border-t border-x p-6 flex flex-col items-center justify-center gap-2 font-mono text-xs ${box}`}
        >
          <span>Example Workbench preview. No project is connected.</span>
          <span className="opacity-60">Illustrative interface only</span>
        </div>
      </div>
    </section>
  );
}
