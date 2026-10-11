import React from 'react';
import { PasswordInput } from './index.js';

export function PasswordInputPreview() {
  return (
    <div className="p-8 max-w-sm mx-auto space-y-4 bg-[#FAF9F6]">
      <PasswordInput variant="expressive" placeholder="Enter secure password" />
    </div>
  );
}
