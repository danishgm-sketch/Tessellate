import React from 'react';
import { AdminConsoleShell } from './index.js';

export function AdminConsoleShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <AdminConsoleShell variant="expressive" />
    </div>
  );
}
