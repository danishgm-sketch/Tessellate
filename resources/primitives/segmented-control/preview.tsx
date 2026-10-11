import React, { useState } from 'react';
import { SegmentedControl } from './index.js';

export function SegmentedControlPreview() {
  const [mode, setMode] = useState('grid');
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <SegmentedControl
        variant="expressive"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'grid', label: 'Grid' },
          { value: 'list', label: 'List' },
          { value: 'compact', label: 'Compact' },
        ]}
      />
    </div>
  );
}
