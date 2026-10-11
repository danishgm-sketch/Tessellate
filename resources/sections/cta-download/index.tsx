import React from 'react';

export type CtaDownloadVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaDownloadProps {
  variant?: CtaDownloadVariant;
}

export function CtaDownload({ variant = 'quiet' }: CtaDownloadProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <span className="text-xs font-mono px-3 py-1 rounded-full border bg-neutral-200/60 dark:bg-neutral-800 mb-6">v1.0.0 RELEASE READY</span>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Install the Tessellate Engine</h2>
        <p className="text-xs sm:text-sm opacity-75 max-w-md mb-8">Available as a global CLI or local development dependency.</p>

        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className="px-5 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">
            npm install @tessellate/cli
          </button>
          <button type="button" className="px-5 py-2.5 rounded-lg border text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800">
            pnpm add @tessellate/cli
          </button>
          <button type="button" className="px-5 py-2.5 rounded-lg border text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800">
            brew install tessellate
          </button>
        </div>
      </div>
    </section>
  );
}
