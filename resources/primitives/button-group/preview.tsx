import React from 'react';
import { ButtonGroup } from './index.js';

export function ButtonGroupPreview() {
  return (
    <div className="p-8 flex flex-col gap-4 items-center bg-[#FAF9F6]">
      <ButtonGroup variant="quiet">
        <button className="px-3 py-1.5 text-xs font-medium">Day</button>
        <button className="px-3 py-1.5 text-xs font-medium">Week</button>
        <button className="px-3 py-1.5 text-xs font-medium">Month</button>
      </ButtonGroup>
    </div>
  );
}
