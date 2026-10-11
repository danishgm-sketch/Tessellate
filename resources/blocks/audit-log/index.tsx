import React from 'react';

export type AuditLogVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AuditLogProps {
  variant?: AuditLogVariant;
}

export function AuditLog({ variant = 'quiet' }: AuditLogProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const logs = [
    { action: 'API_KEY_ROTATED', actor: 'usr_admin99', ip: '192.0.2.1', time: '10m ago' },
    { action: 'PROJECT_CHECKPOINT_SAVED', actor: 'usr_sarah', ip: '198.51.100.4', time: '1h ago' },
    { action: 'DNA_TOKENS_MUTATED', actor: 'agent_cursor', ip: 'local', time: '3h ago' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border font-mono text-xs transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4 font-sans">Security Audit Trail</h3>
      <div className="space-y-3">
        {logs.map((l) => (
          <div key={l.action + l.time} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{l.action}</span>
              <div className="text-[10px] opacity-60">Actor: {l.actor} • IP: {l.ip}</div>
            </div>
            <span className="opacity-50 text-[11px]">{l.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
