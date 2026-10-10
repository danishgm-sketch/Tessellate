import React from 'react';
import { DropdownMenu } from './index.js';

export function DropdownMenuPreview() {
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <DropdownMenu
        variant="expressive"
        trigger={<button className="px-3 py-1.5 border rounded-lg text-sm bg-white shadow-xs">Actions ▾</button>}
        items={[
          { id: 'duplicate', label: 'Duplicate Node', shortcut: '⌘D' },
          { id: 'export', label: 'Export Code', shortcut: '⌘E' },
          { id: 'delete', label: 'Delete', danger: true },
        ]}
      />
    </div>
  );
}
