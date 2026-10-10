import React, { useState } from 'react';
import { Switch } from './index.js';

export function SwitchPreview() {
  const [on, setOn] = useState(true);
  return (
    <div className="p-8 max-w-sm mx-auto bg-[#FAF9F6]">
      <Switch variant="expressive" label="Automated Backups" description="Sync checkpoints to local IndexedDB every minute." checked={on} onChange={setOn} />
    </div>
  );
}
