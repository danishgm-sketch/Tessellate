import React from 'react';
import { AppSidebarCompact } from './index.js';

export function AppSidebarCompactPreview() {
  return (
    <div className="h-64 flex border rounded-xl overflow-hidden bg-[#FAF9F6]">
      <AppSidebarCompact variant="expressive" />
      <div className="flex-1 p-6 text-xs text-neutral-500">Workspace stage</div>
    </div>
  );
}
