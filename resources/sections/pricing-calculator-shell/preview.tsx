import React, { useState } from 'react';
import { PricingCalculatorShell, PricingCalculatorShellVariant } from './index.js';

export function PricingCalculatorShellPreview() {
  const [variant, setVariant] = useState<PricingCalculatorShellVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Pricing Calculator Shell Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as PricingCalculatorShellVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <PricingCalculatorShell variant={variant} />
    </div>
  );
}
