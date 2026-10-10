import React from 'react';
import { CollapsibleSidebar } from './index.js';

export function CollapsibleSidebarPreview() {
  return (
    <div className="h-64 flex border rounded-xl overflow-hidden bg-[#FAF9F6]">
      <CollapsibleSidebar variant="expressive" />
      <div className="flex-1 p-6 text-xs text-neutral-500">Interactive canvas</div>
    </div>
  );
}
