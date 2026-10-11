import React from 'react';
import { CanvasWorkspaceShell } from './index.js';

export function CanvasWorkspaceShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <CanvasWorkspaceShell variant="expressive" />
    </div>
  );
}
