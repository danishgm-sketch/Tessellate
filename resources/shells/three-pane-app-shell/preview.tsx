import React from 'react';
import { ThreePaneAppShell } from './index.js';

export function ThreePaneAppShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <ThreePaneAppShell variant="expressive" />
    </div>
  );
}
