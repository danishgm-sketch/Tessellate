import React from 'react';
import { Popover } from './index.js';

export function PopoverPreview() {
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <Popover
        variant="expressive"
        trigger={<button className="px-3 py-1.5 border rounded-lg text-sm bg-white shadow-xs">Filter Settings</button>}
      >
        <div className="space-y-2 text-xs">
          <p className="font-semibold">Display Density</p>
          <p className="text-neutral-500">Configure visual compact scaling for table rows.</p>
        </div>
      </Popover>
    </div>
  );
}
