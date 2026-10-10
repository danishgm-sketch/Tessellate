import React from 'react';
import { MinimalTopNav } from './index.js';

export function MinimalTopNavPreview() {
  return (
    <div className="w-full space-y-4">
      <MinimalTopNav variant="expressive" actions={<button className="px-3 py-1.5 text-xs bg-[#2547E8] text-white rounded-lg">Sign In</button>} />
    </div>
  );
}
