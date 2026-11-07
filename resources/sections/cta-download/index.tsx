import React from 'react';

export type CtaDownloadVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaDownloadProps {
  variant?: CtaDownloadVariant;
  onInstall?: () => void;
}

export function CtaDownload({ variant = 'quiet', onInstall }: CtaDownloadProps) {
  const noteId = React.useId();
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <span className="text-xs font-mono px-3 py-1 rounded-full border bg-neutral-200/60 dark:bg-neutral-800 mb-6">INSTALLATION TEMPLATE</span>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Install this product</h2>
        <p className="text-xs sm:text-sm opacity-75 max-w-md mb-8">Configure a supported package or download destination before publishing.</p>

        <button type="button" onClick={onInstall} disabled={!onInstall} aria-describedby={noteId} className="px-5 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
          {onInstall ? 'Open installation instructions' : 'Install action not configured'}
        </button>
        <p id={noteId} className="text-xs mt-3 opacity-75">{onInstall ? 'Opens the installation instructions configured by the host application.' : 'This example has no published package or download target configured.'}</p>
      </div>
    </section>
  );
}
