import React from 'react';

export type OrganizationSettingsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OrganizationSettingsProps {
  variant?: OrganizationSettingsVariant;
}

export function OrganizationSettings({ variant = 'quiet' }: OrganizationSettingsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921]';
  }

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-base font-bold mb-6">Organization Settings</h3>
      <div className="space-y-4 max-w-md text-xs">
        <div>
          <label className="font-semibold block mb-1">Organization Name</label>
          <input
            type="text"
            defaultValue="Acme Systems Ltd"
            className={`w-full p-2.5 rounded-lg border outline-none ${inputBorder}`}
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">Custom Domain</label>
          <input
            type="text"
            defaultValue="ui.acme.corp"
            className={`w-full p-2.5 rounded-lg border font-mono outline-none ${inputBorder}`}
          />
        </div>
        <button type="button" className="px-5 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-xs">
          Update Organization
        </button>
      </div>
    </div>
  );
}
