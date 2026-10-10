import React from 'react';
import { Tooltip } from './index.js';

export function TooltipPreview() {
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <Tooltip variant="expressive" content="Export as React project (⌘E)">
        <button className="px-3 py-1.5 border rounded-lg text-sm bg-white shadow-xs">Export</button>
      </Tooltip>
    </div>
  );
}
