import React from 'react';
import { ImmersiveFullscreenShell } from './index.js';

export function ImmersiveFullscreenShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <ImmersiveFullscreenShell variant="nocturne" />
    </div>
  );
}
