import React from 'react';

export type WorkflowBuilderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WorkflowBuilderProps {
  variant?: WorkflowBuilderVariant;
}

export function WorkflowBuilder({ variant = 'quiet' }: WorkflowBuilderProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let node = 'border-neutral-200 bg-neutral-50/60 font-mono text-xs';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    node = 'border-blue-200 bg-white shadow-2xs font-mono text-xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    node = 'border-[#2E3440] bg-[#151921] font-mono text-xs';
  }

  const nodes = [
    { type: 'TRIGGER', title: 'On Manifest Change' },
    { type: 'CONDITION', title: 'Quality >= 80' },
    { type: 'ACTION', title: 'Emit Clean TSX Bundle' },
  ];

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-6">Automation Pipeline</h3>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {nodes.map((n, i) => (
          <React.Fragment key={n.title}>
            <div className={`p-4 rounded-xl border text-center w-full sm:w-auto ${node}`}>
              <span className="text-[10px] font-bold opacity-50 block mb-1 uppercase">{n.type}</span>
              <span className="font-semibold">{n.title}</span>
            </div>
            {i < nodes.length - 1 && (
              <span className="text-neutral-400 font-bold rotate-90 sm:rotate-0">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
