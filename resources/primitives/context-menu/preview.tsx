import React from 'react';
import { ContextMenu } from './index.js';

export function ContextMenuPreview() {
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <ContextMenu variant="expressive">
        <div className="p-12 border-2 border-dashed border-neutral-300 rounded-xl text-center text-xs text-neutral-500">
          Right-click inside this zone to inspect context actions
        </div>
      </ContextMenu>
    </div>
  );
}
