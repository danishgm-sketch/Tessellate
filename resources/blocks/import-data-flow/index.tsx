import React from 'react';

export type ImportDataFlowVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ImportDataFlowProps {
  variant?: ImportDataFlowVariant;
}

export function ImportDataFlow({ variant = 'quiet' }: ImportDataFlowProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let dropzone = 'border-dashed border-neutral-300 bg-neutral-50/50';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    dropzone = 'border-dashed border-blue-300 bg-blue-50/30';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    dropzone = 'border-dashed border-[#2E3440] bg-[#151921]';
  }

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border text-center transition-colors ${bg}`}>
      <h3 className="text-base font-bold mb-2">Import Project or Manifest</h3>
      <p className="text-xs opacity-75 mb-6">Drop a project.json or resource schema to open in Workbench.</p>

      <div className={`p-8 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer ${dropzone}`}>
        <span className="font-mono text-xl mb-2">↑</span>
        <span className="font-semibold text-xs mb-1">Drag and drop file here</span>
        <span className="text-[11px] opacity-60">Supports JSON schema version 1.0.0</span>
      </div>
    </div>
  );
}
