import React, { useState } from 'react';

export type WebhookManagementVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WebhookManagementProps {
  variant?: WebhookManagementVariant;
  onAddEndpoint?: () => void;
}

const INITIAL_HOOKS = [
  { url: 'https://api.example.com/webhooks/tessellate', status: 'Example · not live', events: 'project.updated' },
];

export function WebhookManagement({ variant = 'quiet', onAddEndpoint }: WebhookManagementProps) {
  const [hooks, setHooks] = useState(INITIAL_HOOKS);
  const [statusMessage, setStatusMessage] = useState('');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let subtle = 'text-neutral-700';
  let rowBorder = 'border-neutral-200';
  let badgeClass = 'bg-emerald-500/10 text-emerald-800';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    subtle = 'text-neutral-300';
    rowBorder = 'border-[#2E3440]';
    badgeClass = 'bg-emerald-500/15 text-emerald-300';
  }

  const handleAddEndpoint = () => {
    const nextIndex = hooks.length - INITIAL_HOOKS.length + 1;
    setHooks((previous) => [
      ...previous,
      {
        url: `https://api.example.com/webhooks/endpoint-${nextIndex}`,
        status: 'Example · not live',
        events: 'export.requested',
      },
    ]);
    setStatusMessage('Preview only: added an example endpoint locally; no webhook delivery is active.');
    onAddEndpoint?.();
  };

  const handleReset = () => {
    setHooks(INITIAL_HOOKS);
    setStatusMessage('Reset to initial example endpoint.');
  };

  return (
    <div className={`w-full p-4 @sm:p-6 @md:p-8 rounded-xl border transition-colors ${bg}`}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
        <h3 className="text-base font-bold">Configured Webhooks</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleAddEndpoint}
            className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
          >
            + Add Endpoint
          </button>
          {hooks.length > INITIAL_HOOKS.length && (
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
      <p className={`text-xs mb-5 ${subtle}`}>Example webhook configuration (preview only)</p>

      <div className="space-y-3 font-mono text-xs">
        {hooks.map((h) => (
          <div key={h.url} className={`min-w-0 p-3 rounded-lg border flex flex-col @sm:flex-row @sm:items-center @sm:justify-between gap-3 ${rowBorder}`}>
            <div className="min-w-0">
              <div className="font-semibold break-all">{h.url}</div>
              <span className={`text-xs ${subtle}`}>Events: {h.events}</span>
            </div>
            <span className={`w-fit shrink-0 text-xs px-2 py-0.5 rounded font-bold ${badgeClass}`}>
              {h.status}
            </span>
          </div>
        ))}
      </div>
      {statusMessage && (
        <p role="status" className={`text-xs mt-4 font-sans ${subtle}`}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}
