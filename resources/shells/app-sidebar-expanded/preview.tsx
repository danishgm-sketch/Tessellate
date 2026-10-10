import React from 'react';
import { AppSidebarExpanded } from './index.js';

export function AppSidebarExpandedPreview() {
  return (
    <div className="h-80 flex border rounded-xl overflow-hidden bg-[#FAF9F6]">
      <AppSidebarExpanded variant="expressive" />
      <div className="flex-1 p-6 text-xs text-neutral-500">Main viewport</div>
    </div>
  );
}
