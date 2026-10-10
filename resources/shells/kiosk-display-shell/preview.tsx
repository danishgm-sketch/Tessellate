import React from 'react';
import { KioskDisplayShell } from './index.js';

export function KioskDisplayShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <KioskDisplayShell variant="expressive" />
    </div>
  );
}
