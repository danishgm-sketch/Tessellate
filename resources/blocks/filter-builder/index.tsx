import React, { useState } from 'react';

export type FilterBuilderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FilterBuilderProps {
  variant?: FilterBuilderVariant;
}

export function FilterBuilder({ variant = 'quiet' }: FilterBuilderProps) {
  const [rules, setRules] = useState([
    { id: 1, field: 'Quality', op: 'greater than', val: '80' },
    { id: 2, field: 'Status', op: 'equals', val: 'verified' },
  ]);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const addRule = () => {
    setRules([...rules, { id: Date.now(), field: 'Category', op: 'equals', val: 'primitives' }]);
  };

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold">Filter Rules</h3>
        <button type="button" onClick={addRule} className="text-xs px-2.5 py-1 rounded border">
          + Add Condition
        </button>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {rules.map((r) => (
          <div key={r.id} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
            <span className="font-bold">{r.field}</span>
            <span className="opacity-60">{r.op}</span>
            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">{r.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
