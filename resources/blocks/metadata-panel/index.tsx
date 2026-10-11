import React from 'react';

export type MetadataPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MetadataPanelProps {
  variant?: MetadataPanelVariant;
}

export function MetadataPanel({ variant = 'quiet' }: MetadataPanelProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const props = [
    { k: 'Schema Version', v: '1.0.0' },
    { k: 'Resource ID', v: 'res_blk_metadata_panel' },
    { k: 'License SPDX', v: 'MIT' },
    { k: 'Dependencies', v: '0 external' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border font-mono text-xs transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4 font-sans">Technical Metadata</h3>
      <div className="space-y-3">
        {props.map((p) => (
          <div key={p.k} className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-neutral-800">
            <span className="opacity-60">{p.k}</span>
            <span className="font-semibold">{p.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
