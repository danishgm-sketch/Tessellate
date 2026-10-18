import React, { useState } from 'react';

export type AdvancedDataTableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AdvancedDataTableProps {
  variant?: AdvancedDataTableVariant;
  title?: string;
  rows?: Array<{
    id: number;
    name: string;
    type: string;
    quality: number;
    status: string;
    displayValue?: string;
    href?: string;
  }>;
  columnLabels?: { name: string; type: string; quality: string; status: string };
}

export function AdvancedDataTable({
  variant = 'quiet',
  title = 'Sample records',
  rows: suppliedRows,
  columnLabels = { name: 'Name', type: 'Type', quality: 'Progress', status: 'Status' },
}: AdvancedDataTableProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [query, setQuery] = useState('');

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const rows = suppliedRows ?? [
    { id: 1, name: 'button', type: 'primitive', quality: 98, status: 'verified' },
    { id: 2, name: 'editorial-hero', type: 'section', quality: 96, status: 'verified' },
    { id: 3, name: 'admin-console-shell', type: 'block', quality: 96, status: 'verified' },
  ];
  const filteredRows = rows.filter((row) =>
    `${row.name} ${row.type} ${row.status}`.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div
      style={{
        '--tess-ink-muted': variant === 'nocturne' ? '#A8AFBA' : '#62666F',
        '--tess-ink-secondary': variant === 'nocturne' ? '#D1D5DB' : '#4B5563',
      } as React.CSSProperties}
      className={`w-full rounded-[var(--tess-radius-xl,8px)] border overflow-hidden transition-colors ${bg}`}
    >
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-xs">
        <span className="font-semibold">
          {title} · {selected.length} selected
        </span>
        <input
          aria-label={`Filter ${title}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter records"
          className="min-w-0 w-32 px-2 py-1 rounded border bg-transparent"
        />
      </div>

      <div
        data-testid="advanced-data-table-scroll"
        className="hidden overflow-x-auto sm:block"
        role="region"
        aria-label={`${title} table`}
        tabIndex={0}
      >
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="p-3 w-8">#</th>
              <th className="p-3">{columnLabels.name}</th>
              <th className="p-3">{columnLabels.type}</th>
              <th className="p-3">{columnLabels.quality}</th>
              <th className="p-3">{columnLabels.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredRows.length > 0 ? (
              filteredRows.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${r.name}`}
                      checked={selected.includes(r.id)}
                      onChange={() => toggle(r.id)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="p-3 font-semibold font-sans">
                    {r.href ? (
                      <a
                        href={r.href}
                        className="underline decoration-neutral-300 underline-offset-4 hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      >
                        {r.name}
                      </a>
                    ) : (
                      r.name
                    )}
                  </td>
                  <td className="p-3 opacity-75">{r.type}</td>
                  <td
                    className={`p-3 ${/(not connected|unavailable|not available|not configured)/i.test(r.displayValue ?? '') ? (variant === 'nocturne' ? 'text-neutral-300' : 'text-neutral-600') : variant === 'nocturne' ? 'text-emerald-300' : 'text-emerald-800'} font-bold`}
                  >
                    {r.displayValue ?? `${r.quality}/100`}
                  </td>
                  <td className="p-3 uppercase text-[10px]">{r.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-neutral-500">
                  <p role="status" aria-live="polite">
                    {rows.length === 0 ? 'No records to show.' : 'No records match this filter.'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div data-testid="advanced-data-table-mobile-records" className="grid gap-3 p-3 sm:hidden">
        {filteredRows.length > 0 ? (
          filteredRows.map((row) => {
            const displayValue = row.displayValue ?? `${row.quality}/100`;
            const valueIsUnavailable =
              /(not connected|unavailable|not available|not configured)/i.test(displayValue);
            return (
              <article
                key={row.id}
                data-testid="advanced-data-table-mobile-record"
                className="min-w-0 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${row.name}`}
                    checked={selected.includes(row.id)}
                    onChange={() => toggle(row.id)}
                    className="mt-1 min-h-5 min-w-5 cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-sm font-semibold">
                      {row.href ? (
                        <a
                          href={row.href}
                          className="underline decoration-neutral-300 underline-offset-4 hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        >
                          {row.name}
                        </a>
                      ) : (
                        row.name
                      )}
                    </h3>
                    <dl className="mt-3 grid gap-2 text-xs">
                      <div className="min-w-0">
                        <dt className="font-semibold text-neutral-500">{columnLabels.type}</dt>
                        <dd className="mt-0.5 break-words">{row.type}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="font-semibold text-neutral-500">{columnLabels.quality}</dt>
                        <dd
                          className={`mt-0.5 break-words font-semibold ${valueIsUnavailable ? (variant === 'nocturne' ? 'text-neutral-300' : 'text-neutral-600') : variant === 'nocturne' ? 'text-emerald-300' : 'text-emerald-800'}`}
                        >
                          {displayValue}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="font-semibold text-neutral-500">{columnLabels.status}</dt>
                        <dd className="mt-0.5 break-words uppercase">{row.status}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <p role="status" aria-live="polite" className="p-3 text-center text-sm text-neutral-500">
            {rows.length === 0 ? 'No records to show.' : 'No records match this filter.'}
          </p>
        )}
      </div>
    </div>
  );
}
