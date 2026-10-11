import React, { useState } from 'react';
import { CursorSpotlight, CursorSpotlightVariant } from './index';

export function CursorSpotlightPreview() {
  const [variant, setVariant] = useState<CursorSpotlightVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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
      <CursorSpotlight variant={variant} />
    </div>
  );
}
