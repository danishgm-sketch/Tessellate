import React from 'react';
import { SettingsShell } from './index.js';

export function SettingsShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <SettingsShell variant="expressive" />
    </div>
  );
}
