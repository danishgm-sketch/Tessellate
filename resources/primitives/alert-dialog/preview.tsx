import React, { useState } from 'react';
import { AlertDialog } from './index.js';

export function AlertDialogPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <button onClick={() => setOpen(true)} className="px-4 py-2 border border-rose-300 text-rose-600 rounded-lg text-sm bg-white">
        Delete Project
      </button>
      <AlertDialog
        variant="expressive"
        open={open}
        onClose={() => setOpen(false)}
        title="Delete workspace project?"
        description="This action cannot be undone. All unsynced local mutations will be permanently cleared."
        onConfirm={() => setOpen(false)}
      />
    </div>
  );
}
