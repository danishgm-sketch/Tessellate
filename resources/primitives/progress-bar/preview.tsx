import React from 'react';
import { ProgressBar } from './index.js';

export function ProgressBarPreview() {
  return (
    <div className="p-8 max-w-sm mx-auto space-y-4 bg-[#FAF9F6]">
      <ProgressBar variant="expressive" value={68} showLabel />
    </div>
  );
}
