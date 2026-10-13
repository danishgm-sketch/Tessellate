import React from 'react';

export type MessagingShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MessagingShellProps {
  variant?: MessagingShellVariant;
}

export function MessagingShell({ variant = 'quiet' }: MessagingShellProps) {
  let theme = 'bg-white text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#11141B] text-white';

  return (
    <div className={`h-screen flex divide-x text-xs ${theme}`}>
      <div className="w-56 p-4 space-y-2 shrink-0">
        <span className="font-semibold block mb-2">Channels</span>
        <p className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 font-medium"># product-engine</p>
        <p className="p-1.5 rounded opacity-70"># design-dna</p>
      </div>
      <div className="flex-1 flex flex-col justify-between p-4">
        <div className="space-y-3">
          <p className="font-semibold text-xs border-b pb-2"># product-engine</p>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
            <span className="font-bold">Ada:</span> Composed project passed Zod schema validation.
          </div>
        </div>
        <input type="text" placeholder="Type message..." className="border p-2 rounded-lg text-xs" />
      </div>
    </div>
  );
}
