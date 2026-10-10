import React from 'react';
import { MessagingShell } from './index.js';

export function MessagingShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <MessagingShell variant="expressive" />
    </div>
  );
}
