import React from 'react';

export type RelationshipPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RelationshipPanelProps {
  variant?: RelationshipPanelVariant;
}

export function RelationshipPanel({ variant = 'quiet' }: RelationshipPanelProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Entity Relationships</h3>
      <div className="space-y-4 text-xs font-mono">
        <div>
          <span className="text-[10px] font-bold opacity-50 uppercase block mb-1">Parent Container</span>
          <div className="p-2 rounded border border-neutral-200 dark:border-neutral-800">
            resources/shells/analytics-shell
          </div>
        </div>
        <div>
          <span className="text-[10px] font-bold opacity-50 uppercase block mb-1">Child Dependencies (0)</span>
          <div className="p-2 rounded border border-neutral-200 dark:border-neutral-800 opacity-60">
            None (Pure Self-Contained Leaf)
          </div>
        </div>
      </div>
    </div>
  );
}
