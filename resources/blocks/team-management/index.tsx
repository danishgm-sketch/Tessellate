import React, { useState } from 'react';

export type TeamManagementVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TeamManagementProps {
  variant?: TeamManagementVariant;
  onInviteMember?: () => void;
}

const INITIAL_MEMBERS = [
  { name: 'Elena Rostova', email: 'elena@example.com', role: 'Owner' },
  { name: 'David Kim', email: 'david@example.com', role: 'Editor' },
];

export function TeamManagement({ variant = 'quiet', onInviteMember }: TeamManagementProps) {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [statusMessage, setStatusMessage] = useState('');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let subtle = 'text-neutral-700';
  let rowBorder = 'border-neutral-200';
  let badgeClass = 'bg-neutral-100 text-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    subtle = 'text-neutral-300';
    rowBorder = 'border-[#2E3440]';
    badgeClass = 'bg-[#151921] text-neutral-200 border border-[#2E3440]';
  }

  const handleInvite = () => {
    const nextIndex = members.length - INITIAL_MEMBERS.length + 1;
    setMembers((previous) => [
      ...previous,
      {
        name: `Example Member ${nextIndex}`,
        email: `member-${nextIndex}@example.com`,
        role: 'Pending example',
      },
    ]);
    setStatusMessage('Preview only: added an example invite row locally; no invitation email was sent.');
    onInviteMember?.();
  };

  const handleReset = () => {
    setMembers(INITIAL_MEMBERS);
    setStatusMessage('Reset to initial example team list.');
  };

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border transition-colors ${bg}`}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
        <h3 className="text-base font-bold">Team Members</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleInvite}
            className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
          >
            + Invite Member
          </button>
          {members.length > INITIAL_MEMBERS.length && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      <p className={`text-xs mb-5 ${subtle}`}>Example team members (preview only)</p>

      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.email} className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs ${rowBorder}`}>
            <div className="min-w-0">
              <div className="font-semibold">{m.name}</div>
              <div className={`text-xs font-mono break-all ${subtle}`}>{m.email}</div>
            </div>
            <span className={`font-mono text-xs px-2 py-0.5 rounded shrink-0 ${badgeClass}`}>
              {m.role}
            </span>
          </div>
        ))}
      </div>
      {statusMessage && (
        <p role="status" className={`text-xs mt-4 ${subtle}`}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}
