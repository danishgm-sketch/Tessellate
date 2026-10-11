import React from 'react';

export type RolePermissionsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RolePermissionsProps {
  variant?: RolePermissionsVariant;
}

export function RolePermissions({ variant = 'quiet' }: RolePermissionsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const perms = [
    { op: 'Mutate DNA Tokens', owner: '✓', editor: '✓', viewer: '—' },
    { op: 'Export Standalone TSX', owner: '✓', editor: '✓', viewer: '✓' },
    { op: 'Rotate API Keys', owner: '✓', editor: '—', viewer: '—' },
  ];

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border text-xs transition-colors ${bg}`}>
      <h3 className="text-base font-bold mb-6 font-sans">Role Permission Matrix (RBAC)</h3>
      <table className="w-full text-left font-mono">
        <thead className="border-b border-neutral-200 dark:border-neutral-800 opacity-60 text-[10px] uppercase">
          <tr>
            <th className="py-2">Operation</th>
            <th className="py-2">Owner</th>
            <th className="py-2">Editor</th>
            <th className="py-2">Viewer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
          {perms.map((p) => (
            <tr key={p.op}>
              <td className="py-2.5 font-sans font-semibold">{p.op}</td>
              <td className="py-2.5 text-emerald-600 font-bold">{p.owner}</td>
              <td className="py-2.5">{p.editor}</td>
              <td className="py-2.5 opacity-50">{p.viewer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
