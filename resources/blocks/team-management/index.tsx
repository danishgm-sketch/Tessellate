import React from 'react';

export type TeamManagementVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TeamManagementProps {
  variant?: TeamManagementVariant;
}

export function TeamManagement({ variant = 'quiet' }: TeamManagementProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const members = [
    { name: 'Elena Rostova', email: 'elena@synthetix.cloud', role: 'Owner' },
    { name: 'David Kim', email: 'david@synthetix.cloud', role: 'Editor' },
  ];

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border transition-colors ${bg}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold">Team Members</h3>
        <button type="button" className="px-3 py-1.5 rounded-lg border text-xs font-semibold">
          + Invite Member
        </button>
      </div>

      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.email} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold">{m.name}</div>
              <div className="text-[11px] opacity-60 font-mono">{m.email}</div>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
              {m.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
