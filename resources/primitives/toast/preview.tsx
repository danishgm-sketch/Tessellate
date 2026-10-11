import React from 'react';
import { Toast } from './index.js';

export function ToastPreview() {
  return (
    <div className="p-8 flex flex-col gap-3 items-center bg-[#FAF9F6]">
      <Toast variant="expressive" type="success" title="Project Published" description="Your workspace was successfully exported to Cloudflare Pages." />
      <Toast variant="quiet" type="info" title="Checkpoint Saved" />
    </div>
  );
}
