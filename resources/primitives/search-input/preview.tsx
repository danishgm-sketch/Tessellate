import React, { useState } from 'react';
import { SearchInput } from './index.js';

export function SearchInputPreview() {
  const [val, setVal] = useState('');
  return (
    <div className="p-8 max-w-md mx-auto space-y-4 bg-[#FAF9F6]">
      <SearchInput variant="expressive" value={val} onChange={(e) => setVal(e.target.value)} onClear={() => setVal('')} />
    </div>
  );
}
