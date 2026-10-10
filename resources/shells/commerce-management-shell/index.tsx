import React from 'react';

export type CommerceManagementShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CommerceManagementShellProps {
  variant?: CommerceManagementShellVariant;
}

export function CommerceManagementShell({ variant = 'quiet' }: CommerceManagementShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={`min-h-screen p-8 space-y-6 ${theme}`}>
      <header className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-base font-bold">Store Operations</h1>
          <p className="text-xs opacity-60">Pending fulfillment orders</p>
        </div>
      </header>
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="border p-4 rounded-xl bg-white dark:bg-neutral-900">Open Orders: 18</div>
        <div className="border p-4 rounded-xl bg-white dark:bg-neutral-900">Low Stock: 3 items</div>
        <div className="border p-4 rounded-xl bg-white dark:bg-neutral-900">Revenue Today: $4,290</div>
      </div>
    </div>
  );
}
