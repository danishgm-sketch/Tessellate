import React, { useState } from 'react';
import { Checkbox } from './index.js';

export function CheckboxPreview() {
  const [agree, setAgree] = useState(true);
  return (
    <div className="p-8 max-w-sm mx-auto space-y-4 bg-[#FAF9F6]">
      <Checkbox
        variant="expressive"
        label="Accept License Agreement"
        description="By continuing, you agree to the open-source MIT terms."
        checked={agree}
        onChange={setAgree}
      />
    </div>
  );
}
