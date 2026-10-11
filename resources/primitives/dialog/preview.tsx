import React, { useState } from 'react';
import { Dialog } from './index.js';

export function DialogPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <button onClick={() => setOpen(true)} className="px-4 py-2 border rounded-lg text-sm bg-white shadow-xs">
        Open Dialog
      </button>
      <Dialog
        variant="expressive"
        open={open}
        onClose={() => setOpen(false)}
        title="Create Design Direction"
        description="Specify the archetype and structural parameters for generation."
        footer={
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 bg-[#2547E8] text-white text-xs rounded-lg font-medium">
            Confirm
          </button>
        }
      >
        <p className="text-xs text-neutral-600">Enter direction seed and constraints.</p>
      </Dialog>
    </div>
  );
}
