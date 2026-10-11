import React from 'react';
import { Link } from './index.js';

export function LinkPreview() {
  return (
    <div className="p-8 flex gap-6 justify-center bg-[#FAF9F6]">
      <Link variant="quiet" href="#">Documentation</Link>
      <Link variant="expressive" href="#" external>Explore API</Link>
      <Link variant="nocturne" href="#">Changelog</Link>
    </div>
  );
}
