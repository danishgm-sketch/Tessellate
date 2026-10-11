import React from 'react';

export type ApiKeyManagementVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ApiKeyManagementProps {
  variant?: ApiKeyManagementVariant;
}

export function ApiKeyManagement({ variant = 'quiet' }: ApiKeyManagementProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const keys = [
    { label: 'Production Agent Token', key: 'tess_live_••••••••••••94b2', created: '3d ago' },
    { label: 'Local Development Key', key: 'tess_test_••••••••••••11a0', created: '2w ago' },
  ];

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border transition-colors ${bg}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold">API Tokens</h3>
        <button type="button" className="px-3 py-1.5 rounded-lg border text-xs font-semibold">
          + Create New Token
        </button>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {keys.map((k) => (
          <div key={k.label} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <div className="font-semibold font-sans">{k.label}</div>
              <div className="text-[11px] opacity-60">{k.key}</div>
            </div>
            <button type="button" className="text-rose-500 hover:underline text-[11px]">
              Revoke
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
