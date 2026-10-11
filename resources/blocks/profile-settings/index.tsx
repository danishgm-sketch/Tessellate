import React from 'react';

export type ProfileSettingsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProfileSettingsProps {
  variant?: ProfileSettingsVariant;
}

export function ProfileSettings({ variant = 'quiet' }: ProfileSettingsProps) {
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
      <h3 className="text-base font-bold mb-6">Profile Settings</h3>
      <div className="space-y-4 max-w-md text-xs">
        <div>
          <label className="font-semibold block mb-1">Display Name</label>
          <input
            type="text"
            defaultValue="Alex Morgan"
            className={`w-full p-2.5 rounded-lg border outline-none ${inputBorder}`}
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">Email Address</label>
          <input
            type="email"
            defaultValue="alex@tessellate.design"
            className={`w-full p-2.5 rounded-lg border outline-none ${inputBorder}`}
          />
        </div>
        <button type="button" className="px-5 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-xs">
          Save Changes
        </button>
      </div>
    </div>
  );
}
