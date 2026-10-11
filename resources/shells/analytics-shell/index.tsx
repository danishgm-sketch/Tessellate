import React from 'react';

export type AnalyticsShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AnalyticsShellProps {
  variant?: AnalyticsShellVariant;
  children?: React.ReactNode;
}

export function AnalyticsShell({
  variant = 'quiet',
  children = <div className="grid grid-cols-4 gap-4"><div className="border p-4 rounded-xl">MRR: $84k</div><div className="border p-4 rounded-xl">DAU: 12.4k</div><div className="border p-4 rounded-xl">Churn: 0.8%</div><div className="border p-4 rounded-xl">NPS: 74</div></div>,
}: AnalyticsShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={`min-h-screen p-8 space-y-6 ${theme}`}>
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-base font-bold">Analytics & Growth</h1>
          <p className="text-xs opacity-60">Trailing 30 days telemetry</p>
        </div>
        <div className="flex gap-2 text-xs">
          <button className="px-3 py-1.5 border rounded-lg bg-white dark:bg-neutral-900">Last 30 Days</button>
          <button className="px-3 py-1.5 border rounded-lg bg-white dark:bg-neutral-900">Export CSV</button>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
