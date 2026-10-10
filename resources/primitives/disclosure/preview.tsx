import React from 'react';
import { Disclosure } from './index.js';

export function DisclosurePreview() {
  return (
    <div className="p-8 max-w-sm mx-auto bg-[#FAF9F6]">
      <Disclosure variant="expressive" title="Advanced Generator Parameters">
        <p>Seed value: 0x93FA. Convergence threshold: 0.05.</p>
      </Disclosure>
    </div>
  );
}
