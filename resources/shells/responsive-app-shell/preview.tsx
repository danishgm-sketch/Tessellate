import React from 'react';
import { ResponsiveAppShell } from './index.js';

export function ResponsiveAppShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <ResponsiveAppShell variant="expressive" />
    </div>
  );
}
