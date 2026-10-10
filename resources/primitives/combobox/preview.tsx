import React, { useState } from 'react';
import { Combobox } from './index.js';

export function ComboboxPreview() {
  const [val, setVal] = useState('us');
  return (
    <div className="p-8 max-w-xs mx-auto bg-[#FAF9F6]">
      <Combobox
        variant="expressive"
        label="Country Region"
        value={val}
        onSelect={setVal}
        options={[
          { value: 'us', label: 'United States' },
          { value: 'gb', label: 'United Kingdom' },
          { value: 'de', label: 'Germany' },
          { value: 'jp', label: 'Japan' },
        ]}
      />
    </div>
  );
}
