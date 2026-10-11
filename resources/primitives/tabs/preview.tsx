import React, { useState } from 'react';
import { Tabs } from './index.js';

export function TabsPreview() {
  const [tab, setTab] = useState('overview');
  return (
    <div className="p-8 max-w-md mx-auto bg-[#FAF9F6]">
      <Tabs
        variant="expressive"
        activeId={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Overview', content: <p className="text-neutral-600">High-level interface telemetry metrics.</p> },
          { id: 'analytics', label: 'Analytics', content: <p className="text-neutral-600">Detailed conversion rate records.</p> },
          { id: 'settings', label: 'Settings', content: <p className="text-neutral-600">Workspace token and API keys.</p> },
        ]}
      />
    </div>
  );
}
