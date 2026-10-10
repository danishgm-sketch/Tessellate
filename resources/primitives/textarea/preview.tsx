import React from 'react';
import { Textarea } from './index.js';

export function TextareaPreview() {
  return (
    <div className="p-8 max-w-md mx-auto space-y-4 bg-[#FAF9F6]">
      <Textarea variant="quiet" label="System notes" placeholder="Write context..." maxLength={200} />
      <Textarea variant="expressive" label="Project Brief" placeholder="State your requirements..." />
    </div>
  );
}
