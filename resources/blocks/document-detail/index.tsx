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
      <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase mb-2 block">Architecture Spec</span>
      <h2 className="text-xl font-bold mb-4">Deterministic Composition Invariants</h2>
      <div className="space-y-3 text-xs sm:text-sm opacity-80 leading-relaxed mb-6">
        <p>
          All Tessellate interfaces compose through validated manifests rather than arbitrary runtime code mutations. This guarantees full exportability to any modern React environment.
        </p>
      </div>
      <button type="button" className="px-4 py-2 rounded-lg border text-xs font-semibold">
        Export Spec (PDF / Markdown)
      </button>
    </div>
  );
}
