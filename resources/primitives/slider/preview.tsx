import React, { useState } from 'react';
import { Slider } from './index.js';

export function SliderPreview() {
  const [val, setVal] = useState(65);
  return (
    <div className="p-8 max-w-sm mx-auto bg-[#FAF9F6]">
      <Slider variant="expressive" label="Visual Ambition (DNA)" value={val} onChange={setVal} />
    </div>
  );
}
