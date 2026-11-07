import React, { useId } from 'react';

export type AdminConsoleShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AdminConsoleShellProps {
  variant?: AdminConsoleShellVariant;
  onInvite?: () => void;
}

export function AdminConsoleShell({ variant = 'quiet', onInvite }: AdminConsoleShellProps) {
  const inviteNoteId = useId();
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={`min-h-screen p-8 space-y-6 ${theme}`}>
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-base font-bold">Admin Console</h1>
          <p className="text-xs opacity-60">User permissions & security enforcement</p>
        </div>
        <button
          type="button"
          onClick={onInvite}
          disabled={!onInvite}
          aria-describedby={!onInvite ? inviteNoteId : undefined}
          title={!onInvite ? 'Connect an invite handler to enable this action' : undefined}
          className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-lg text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          Invite User
        </button>
      </div>
      <div className="border rounded-xl p-4 bg-white dark:bg-neutral-900 text-xs">
        <p className="font-semibold mb-2">Example organization data</p>
        <p className="opacity-60">Member count and identity provider are not connected.</p>
        {!onInvite && <p id={inviteNoteId} className="mt-3 text-neutral-500">Connect an invite handler to enable this action.</p>}
      </div>
    </div>
  );
}
