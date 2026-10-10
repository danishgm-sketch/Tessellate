import React from 'react';
import { Separator } from './index.js';

export function SeparatorPreview() {
  return (
    <div className="p-8 max-w-sm mx-auto space-y-4 bg-[#FAF9F6]">
      <p className="text-xs text-neutral-600">Upper section content</p>
      <Separator variant="expressive" label="OR" />
      <p className="text-xs text-neutral-600">Lower section content</p>
    </div>
  );
}
