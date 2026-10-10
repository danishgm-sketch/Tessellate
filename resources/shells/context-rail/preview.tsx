import React from 'react';
import { ContextRail } from './index.js';

export function ContextRailPreview() {
  return (
    <div className="h-64 flex justify-end border rounded-xl overflow-hidden bg-[#FAF9F6]">
      <ContextRail variant="expressive" />
    </div>
  );
}
