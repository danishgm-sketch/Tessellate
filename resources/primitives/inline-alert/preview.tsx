import React from 'react';
import { InlineAlert } from './index.js';

export function InlineAlertPreview() {
  return (
    <div className="p-8 max-w-md mx-auto space-y-3 bg-[#FAF9F6]">
      <InlineAlert variant="expressive" intent="info" title="Deterministic Composition" description="All layout blueprints are constructed with validated Zod contracts." />
      <InlineAlert variant="quiet" intent="warning" title="Experimental Resource" description="This component has not yet achieved 80 quality score floor." />
    </div>
  );
}
