import React, { useState } from 'react';

export type OnboardingRoleSelectVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OnboardingRoleSelectProps {
  variant?: OnboardingRoleSelectVariant;
}

export function OnboardingRoleSelect({ variant = 'quiet' }: OnboardingRoleSelectProps) {
  const [selected, setSelected] = useState('Engineer');

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const roles = [
    { title: 'Engineer', desc: 'Prioritize raw TSX export & MCP agent tooling.' },
    { title: 'Product Designer', desc: 'Focus on Design DNA & visual harmony.' },
    { title: 'Autonomous Agent', desc: 'Provide JSON schemas & OpenAPI docs.' },
  ];

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border text-center transition-colors ${bg}`}>
      <h3 className="text-base font-bold mb-2">How will you use Tessellate?</h3>
      <p className="text-xs opacity-75 mb-6">Select your primary role to configure default tools.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {roles.map((r) => (
          <div
            key={r.title}
            onClick={() => setSelected(r.title)}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
              selected === r.title ? 'border-neutral-900 dark:border-white ring-1 ring-current' : 'border-neutral-200 dark:border-neutral-800 opacity-70'
            }`}
          >
            <div className="font-bold text-xs mb-1">{r.title}</div>
            <p className="text-[11px] opacity-75">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
