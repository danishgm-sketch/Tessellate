import React, { useState } from 'react';
import { MultiSelect } from './index.js';

export function MultiSelectPreview() {
  const [items, setItems] = useState(['Design', 'Frontend']);
  return (
    <div className="p-8 max-w-sm mx-auto bg-[#FAF9F6]">
      <MultiSelect
        variant="expressive"
        label="Disciplines"
        options={['Design', 'Frontend', 'Backend', 'DevOps', 'QA']}
        selected={items}
        onChange={setItems}
      />
    </div>
  );
}
