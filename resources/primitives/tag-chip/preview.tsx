import React, { useState } from 'react';
import { TagChip } from './index.js';

export function TagChipPreview() {
  const [selected, setSelected] = useState(true);
  return (
    <div className="p-8 flex gap-3 justify-center bg-[#FAF9F6]">
      <TagChip variant="expressive" label="React 19" selected={selected} onClick={() => setSelected(!selected)} onRemove={() => {}} />
      <TagChip variant="quiet" label="Tailwind 4" selected={false} />
    </div>
  );
}
