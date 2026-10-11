import React, { useState } from 'react';
import { MiniSparkline, MiniSparklineVariant } from './index';

export function MiniSparklinePreview() {
  const [variant, setVariant] = useState<MiniSparklineVariant>('quiet');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize ${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="p-6 border rounded-xl flex items-center justify-between">
        <div>
          <div className="text-xs text-neutral-400">Cache Hit Ratio</div>
          <div className="text-lg font-bold font-mono">98.4%</div>
        </div>
        <MiniSparkline variant={variant} />
      </div>
    </div>
  );
}
