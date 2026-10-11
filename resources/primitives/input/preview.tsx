import React from 'react';
import { Input } from './index.js';

export function InputPreview() {
  return (
    <div className="p-8 max-w-md mx-auto space-y-4 bg-[#FAF9F6]">
      <Input variant="quiet" label="Full name" placeholder="Ada Lovelace" />
      <Input variant="expressive" label="Email address" placeholder="ada@tessellate.design" helperText="We will never share your email." />
      <Input variant="nocturne" label="API Key" placeholder="sk_live_..." error="Key expired" />
    </div>
  );
}
