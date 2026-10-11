import React, { useState } from 'react';
import { Pagination } from './index.js';

export function PaginationPreview() {
  const [p, setP] = useState(2);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <Pagination variant="expressive" currentPage={p} totalPages={5} onPageChange={setP} />
    </div>
  );
}
