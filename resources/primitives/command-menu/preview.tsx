import React, { useState } from 'react';
import { CommandMenu } from './index.js';

export function CommandMenuPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <button onClick={() => setOpen(true)} className="px-4 py-2 border rounded-lg text-sm bg-white shadow-xs">
        Open Command Palette (⌘K)
      </button>
      <CommandMenu
        variant="expressive"
        open={open}
        onClose={() => setOpen(false)}
        items={[
          { id: '1', category: 'Navigation', label: 'Go to Workbench' },
          { id: '2', category: 'Action', label: 'Trigger Recomposition' },
          { id: '3', category: 'Export', label: 'Download Source ZIP' },
        ]}
      />
    </div>
  );
}
