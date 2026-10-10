import React, { useState } from 'react';
import { Autocomplete } from './index.js';

export function AutocompletePreview() {
  const [val, setVal] = useState('Re');
  return (
    <div className="p-8 max-w-xs mx-auto bg-[#FAF9F6]">
      <Autocomplete
        variant="expressive"
        label="Technology"
        value={val}
        onChange={setVal}
        suggestions={['React', 'Remix', 'Redux', 'Relay', 'Rust']}
      />
    </div>
  );
}
