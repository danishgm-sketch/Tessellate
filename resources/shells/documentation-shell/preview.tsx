import React from 'react';
import { DocumentationShell } from './index.js';

export function DocumentationShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <DocumentationShell variant="expressive" />
    </div>
  );
}
