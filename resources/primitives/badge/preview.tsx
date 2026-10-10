import React from 'react';
import { Badge } from './index.js';

export function BadgePreview() {
  return (
    <div className="p-8 flex flex-wrap gap-3 justify-center bg-[#FAF9F6]">
      <Badge variant="quiet">v1.0.0</Badge>
      <Badge variant="expressive" intent="primary" dot>Verified</Badge>
      <Badge variant="expressive" intent="success">Active</Badge>
      <Badge variant="nocturne" intent="primary">Nocturne</Badge>
    </div>
  );
}
