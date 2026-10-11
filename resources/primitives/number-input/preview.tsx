import React, { useState } from 'react';
import { NumberInput } from './index.js';

export function NumberInputPreview() {
  const [val, setVal] = useState(5);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <NumberInput variant="expressive" label="Instances" value={val} onChange={setVal} unit="nodes" />
    </div>
  );
}
