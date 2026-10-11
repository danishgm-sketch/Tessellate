import React, { useState } from 'react';
import { IconButton, type IconButtonVariant } from './index.js';

export function IconButtonPreview() {
  const [variant, setVariant] = useState<IconButtonVariant>('expressive');
  const isDark = variant === 'nocturne';

  return (
    <div className={`p-8 min-h-full transition-colors ${isDark ? 'bg-[#0B0D10] text-white' : 'bg-[#FAF9F6] text-neutral-900'}`}>
      <div className="flex gap-4 items-center justify-center">
        <IconButton variant={variant} aria-label="Add item" />
        <IconButton variant={variant} size="lg" aria-label="Add item large" />
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {(['quiet', 'expressive', 'nocturne'] as IconButtonVariant[]).map((v) => (
          <button key={v} onClick={() => setVariant(v)} className="px-3 py-1 text-xs border rounded capitalize">
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
