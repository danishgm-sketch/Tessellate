import React, { useState } from 'react';
import { Select } from './index.js';

export function SelectPreview() {
  const [val, setVal] = useState('react');
  return (
    <div className="p-8 max-w-xs mx-auto bg-[#FAF9F6]">
      <Select
        variant="expressive"
        label="Framework Target"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        options={[
          { value: 'react', label: 'React + TypeScript' },
          { value: 'vue', label: 'Vue 3' },
          { value: 'svelte', label: 'Svelte 5' },
        ]}
      />
    </div>
  );
}
