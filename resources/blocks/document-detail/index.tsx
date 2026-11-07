import React from 'react';

export type DocumentDetailVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DocumentDetailProps {
  variant?: DocumentDetailVariant;
}

export function DocumentDetail({ variant = 'quiet' }: DocumentDetailProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border transition-colors ${bg}`}>
      <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase mb-2 block">Sample Project Note</span>
      <h2 className="text-xl font-bold mb-4">Interface structure in a project manifest</h2>
      <div className="space-y-3 text-xs sm:text-sm opacity-80 leading-relaxed mb-6">
        <p>
          Tessellate stores interface structure in validated manifests. Its React/Vite exporter generates project source that you can review and adapt for your application.
        </p>
      </div>
      <p className="text-xs text-neutral-600 dark:text-neutral-300">
        This card is a static example. Connect an export action in the host application when needed.
      </p>
    </div>
  );
}
