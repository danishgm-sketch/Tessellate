import React, { useState } from 'react';
import { RadioGroup } from './index.js';

export function RadioGroupPreview() {
  const [val, setVal] = useState('monthly');
  return (
    <div className="p-8 max-w-sm mx-auto bg-[#FAF9F6]">
      <RadioGroup
        variant="expressive"
        value={val}
        onChange={setVal}
        options={[
          { value: 'monthly', label: 'Monthly Billing', description: 'Billed monthly at standard rate.' },
          { value: 'yearly', label: 'Annual Billing', description: 'Save 20% with annual upfront commitment.' },
        ]}
      />
    </div>
  );
}
