import React from 'react';
import { Avatar } from './index.js';

export function AvatarPreview() {
  return (
    <div className="p-8 flex gap-4 items-center justify-center bg-[#FAF9F6]">
      <Avatar variant="quiet" initials="AL" status="online" size="sm" />
      <Avatar variant="expressive" initials="TL" status="online" size="md" />
      <Avatar variant="nocturne" initials="NC" size="lg" status="busy" />
    </div>
  );
}
