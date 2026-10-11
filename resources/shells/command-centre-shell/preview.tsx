import React from 'react';
import { CommandCentreShell } from './index.js';

export function CommandCentreShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <CommandCentreShell variant="nocturne" />
    </div>
  );
}
