import React from 'react';

export type WebhookManagementVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WebhookManagementProps {
  variant?: WebhookManagementVariant;
}

export function WebhookManagement({ variant = 'quiet' }: WebhookManagementProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const hooks = [
    { url: 'https://api.acme.corp/webhooks/tessellate', status: '200 OK', events: 'project.updated' },
  ];

  return (
    <div className={`w-full p-4 @sm:p-6 @md:p-8 rounded-xl border transition-colors ${bg}`}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h3 className="text-base font-bold">Configured Webhooks</h3>
        <button type="button" className="px-3 py-1.5 rounded-lg border text-xs font-semibold">
          + Add Endpoint
        </button>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {hooks.map((h) => (
          <div key={h.url} className="min-w-0 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex flex-col @sm:flex-row @sm:items-center @sm:justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold break-all">{h.url}</div>
              <span className="text-[10px] opacity-60">Events: {h.events}</span>
            </div>
            <span className="w-fit shrink-0 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
              {h.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
