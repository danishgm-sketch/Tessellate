import React from 'react';
import { Breadcrumb } from './index.js';

export function BreadcrumbPreview() {
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <Breadcrumb
        variant="expressive"
        items={[
          { label: 'Workspaces' },
          { label: 'Telemetry Hub' },
          { label: 'Analytics Screen', current: true },
        ]}
      />
    </div>
  );
}
