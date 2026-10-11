import React from 'react';
import { Accordion } from './index.js';

export function AccordionPreview() {
  return (
    <div className="p-8 max-w-md mx-auto bg-[#FAF9F6]">
      <Accordion
        variant="expressive"
        items={[
          { id: '1', title: 'What is Tessellate Design DNA?', content: 'A 10-dimensional mathematical vector capturing visual density, contrast, and motion.' },
          { id: '2', title: 'Can I export clean React code?', content: 'Yes, full standalone Vite + React + Tailwind CSS code is produced without lock-in.' },
        ]}
      />
    </div>
  );
}
