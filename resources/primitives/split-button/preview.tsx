import React from 'react';
import { SplitButton } from './index.js';

export function SplitButtonPreview() {
  return (
    <div className="p-8 flex gap-4 justify-center bg-[#FAF9F6]">
      <SplitButton variant="quiet" label="Publish project" />
      <SplitButton variant="expressive" label="Deploy changes" />
      <SplitButton variant="nocturne" label="Sync cloud" />
    </div>
  );
}
