import React, { useState } from 'react';
import { BottomSheet } from './index.js';

export function BottomSheetPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <button onClick={() => setOpen(true)} className="px-4 py-2 border rounded-lg text-sm bg-white shadow-xs">
        Open Bottom Sheet
      </button>
      <BottomSheet variant="expressive" open={open} onClose={() => setOpen(false)} title="Select Resource Variant">
        <p className="text-xs text-neutral-600">Choose between Quiet, Expressive, and Nocturne presets.</p>
      </BottomSheet>
    </div>
  );
}
