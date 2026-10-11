import React, { useState } from 'react';

export type SettingsNavigationVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SettingsNavigationProps {
  variant?: SettingsNavigationVariant;
}

export function SettingsNavigation({ variant = 'quiet' }: SettingsNavigationProps) {
  const [active, setActive] = useState('Profile');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let activeTab = 'bg-neutral-100 font-semibold';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    activeTab = 'bg-blue-50 text-[#2547E8] font-semibold border-l-2 border-[#2547E8]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    activeTab = 'bg-[#151921] text-cyan-400 font-semibold border-l-2 border-cyan-400';
  }

  const sections = ['Profile', 'Organization', 'Team', 'API Keys', 'Billing', 'Audit Log'];

  return (
    <div className={`w-full p-4 rounded-xl border transition-colors ${bg}`}>
      <div className="space-y-1 text-xs">
        {sections.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActive(s)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              active === s ? activeTab : 'opacity-70 hover:opacity-100 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
