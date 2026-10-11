import React, { useState } from 'react';
import { Drawer } from './index.js';

export function DrawerPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <button onClick={() => setOpen(true)} className="px-4 py-2 border rounded-lg text-sm bg-white shadow-xs">
        Open Inspector Drawer
      </button>
      <Drawer variant="expressive" open={open} onClose={() => setOpen(false)} title="Node Inspector">
        <p className="text-xs text-neutral-600">Properties, overrides, and semantic bindings for selected node.</p>
      </Drawer>
    </div>
  );
}
