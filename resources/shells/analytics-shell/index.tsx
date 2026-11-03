import React from 'react';

export type AnalyticsShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AnalyticsShellProps {
  variant?: AnalyticsShellVariant;
  children?: React.ReactNode;
  onExportCsv?: () => void;
}

export function AnalyticsShell({
  variant = 'quiet',
  children = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="border p-4 rounded-xl"><span className="block text-xs text-neutral-500">Example · Sessions</span><strong>1,240</strong></div>
      <div className="border p-4 rounded-xl"><span className="block text-xs text-neutral-500">Example · Tasks completed</span><strong>86</strong></div>
      <div className="border p-4 rounded-xl"><span className="block text-xs text-neutral-500">Example · Completion</span><strong>92%</strong></div>
      <div className="border p-4 rounded-xl"><span className="block text-xs text-neutral-500">Example · Feedback score</span><strong>4.6/5</strong></div>
    </div>
  ),
  onExportCsv,
}: AnalyticsShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={`min-h-screen p-8 space-y-6 ${theme}`}>
      <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b">
        <div>
          <h1 className="text-base font-bold">Analytics & Growth</h1>
          <p className="text-xs opacity-60">Illustrative sample data — no data source is connected.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1.5 border rounded-lg bg-white dark:bg-neutral-900">Example period: last 30 days</span>
          <button
            type="button"
            onClick={onExportCsv}
            disabled={!onExportCsv}
            aria-describedby={!onExportCsv ? 'analytics-export-help' : undefined}
            className="px-3 py-1.5 border rounded-lg bg-white dark:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Export CSV
          </button>
        </div>
      </div>
      <div>{children}</div>
      {!onExportCsv && (
        <p id="analytics-export-help" role="note" className="text-xs opacity-60">
          Connect a data source and export handler to enable CSV downloads.
        </p>
      )}
    </div>
  );
}
