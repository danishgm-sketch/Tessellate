import React from 'react';
import { AvatarGroup } from './index.js';

export function AvatarGroupPreview() {
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <AvatarGroup
        variant="expressive"
        items={[
          { initials: 'AL' },
          { initials: 'JD' },
          { initials: 'MK' },
          { initials: 'PR' },
          { initials: 'ZW' },
        ]}
      />
    </div>
  );
}
