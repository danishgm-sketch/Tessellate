import React from 'react';
import { Link } from './index.js';

export function LinkPreview() {
  return (
    <div className="p-8 flex gap-6 justify-center bg-[#FAF9F6]">
      <Link variant="quiet" href="/docs">Documentation</Link>
      <Link variant="expressive" href="https://github.com/danishgm-sketch/Tessellate/tree/main/packages" external>Explore packages</Link>
      <Link variant="nocturne" href="https://github.com/danishgm-sketch/Tessellate/releases">Releases</Link>
    </div>
  );
}
