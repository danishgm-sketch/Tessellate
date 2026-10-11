import React from 'react';

export type CtaProductPreviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaProductPreviewProps {
  variant?: CtaProductPreviewVariant;
}

export function CtaProductPreview({ variant = 'quiet' }: CtaProductPreviewProps) {
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
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b overflow-hidden transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Build Without Friction</h2>
        <p className="text-xs sm:text-sm opacity-75 max-w-md mb-8">Join thousands of developers using deterministic composition today.</p>
        <button type="button" className="px-6 py-3 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider mb-12">
          Open Canvas Now
        </button>

        <div className={`w-full h-44 rounded-t-2xl border-t border-x p-6 flex items-center justify-center font-mono text-xs opacity-60 ${box}`}>
          [Workbench Canvas Active: 324 Verified Manifests Ready]
        </div>
      </div>
    </section>
  );
}
