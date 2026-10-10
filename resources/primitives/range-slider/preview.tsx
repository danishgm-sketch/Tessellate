import React, { useState } from 'react';
import { RangeSlider } from './index.js';

export function RangeSliderPreview() {
  const [bounds, setBounds] = useState<[number, number]>([20, 80]);
  return (
    <div className="p-8 max-w-sm mx-auto bg-[#FAF9F6]">
      <RangeSlider variant="expressive" label="Price Filter ($)" value={bounds} onChange={setBounds} />
    </div>
  );
}
