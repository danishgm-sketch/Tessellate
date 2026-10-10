import React from 'react';
import { ProgressRing } from './index.js';

export function ProgressRingPreview() {
  return (
    <div className="p-8 flex gap-6 justify-center bg-[#FAF9F6]">
      <ProgressRing variant="quiet" value={45} />
      <ProgressRing variant="expressive" value={82} />
      <ProgressRing variant="nocturne" value={98} />
    </div>
  );
}
