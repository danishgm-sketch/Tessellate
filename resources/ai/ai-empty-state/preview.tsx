import React, { useState } from 'react';
import { AIEmptyState, AIEmptyStateVariant } from './index';

export function AIEmptyStatePreview() {
  const [variant, setVariant] = useState<AIEmptyStateVariant>('quiet');

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
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
      <AIEmptyState variant={variant} />
    </div>
  );
}
