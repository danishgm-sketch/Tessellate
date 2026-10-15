import React, { useId, useMemo, useState } from 'react';

export type AdvancedDataTableVariant = 'quiet' | 'expressive' | 'nocturne';

export type TableRow = Record<string, string | number | boolean | null>;

export interface AdvancedDataTableProps {
  heading?: string;
  description?: string;
  /** Record type, used in labels ("Search appointments"). */
  entity?: string;
  /** Column keys in display order. Defaults to the keys of the first row. */
  columns?: string[];
  rows?: TableRow[];
  /** Mark the rows as sample data in the caption. */
  sampleData?: boolean;
  pageSize?: number;
  loading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  onRowClick?: (row: TableRow) => void;
  variant?: AdvancedDataTableVariant;
}

const SAMPLE_ROWS: TableRow[] = [
  { name: 'Amira Khan', status: 'Active', created: '2026-01-12' },
  { name: 'Ben Carter', status: 'Pending', created: '2026-01-15' },
  { name: 'Chloe Martin', status: 'Completed', created: '2026-01-18' },
];

function label(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function compare(a: TableRow[string] | undefined, b: TableRow[string] | undefined): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true, sensitivity: 'base' });
}

/** Records table with search, sortable columns (aria-sort), pagination, and loading/empty/error states. */
export function AdvancedDataTable({
  heading,
  description,
  entity = 'record',
  columns,
  rows,
  sampleData,
  pageSize = 10,
  loading = false,
  errorMessage,
  emptyMessage,
  onRowClick,
  variant = 'quiet',
}: AdvancedDataTableProps) {
  const id = useId();
  const data = rows ?? SAMPLE_ROWS;
  const isSample = sampleData ?? !rows;
  const cols = columns && columns.length > 0 ? columns : Object.keys(data[0] ?? { name: '' });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 'ascending' | 'descending' } | null>(null);
  const [page, setPage] = useState(0);
  const plural = `${entity.toLowerCase()}s`;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? data.filter((r) => cols.some((c) => String(r[c] ?? '').toLowerCase().includes(q))) : data;
    if (!sort) return filtered;
    const sorted = [...filtered].sort((a, b) => compare(a[sort.key], b[sort.key]));
    return sort.dir === 'descending' ? sorted.reverse() : sorted;
  }, [data, cols, query, sort]);
  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  const current = Math.min(page, pages - 1);
  const pageRows = visible.slice(current * pageSize, current * pageSize + pageSize);

  const toggleSort = (key: string) => {
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 'ascending' ? 'descending' : 'ascending' } : { key, dir: 'ascending' }));
    setPage(0);
  };
  const shell = variant === 'expressive' ? 'bg-surface-raised shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'bg-surface border-2 border-hairline-strong' : 'bg-surface-raised border border-hairline';
  const control = 'rounded-ui-sm border border-hairline-strong bg-surface-raised px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

  return (
    <section className={`w-full rounded-ui-lg font-body text-ink ${shell}`} aria-labelledby={`${id}-heading`} aria-busy={loading}>
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-4 sm:px-5">
        <div>
          <h2 id={`${id}-heading`} className="font-heading text-lg font-semibold">
            {heading ?? `${entity.charAt(0).toUpperCase()}${entity.slice(1)}s`}
          </h2>
          {description && <p className="mt-0.5 text-sm text-ink-secondary">{description}</p>}
        </div>
        <div>
          <label htmlFor={`${id}-search`} className="sr-only">
            Search {plural}
          </label>
          <input
            id={`${id}-search`}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder={`Search ${plural}`}
            className={`${control} w-56 max-w-full`}
          />
        </div>
      </div>
      <div role="alert" className="px-4 empty:hidden sm:px-5">
        {errorMessage && <p className="mt-3 rounded-ui-sm border border-danger bg-surface px-3 py-2 text-sm text-danger">{errorMessage}</p>}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            {heading ?? plural}
            {isSample ? ' (sample data)' : ''}
          </caption>
          <thead>
            <tr className="border-y border-hairline bg-surface">
              {cols.map((c) => {
                const sorted = sort?.key === c ? sort.dir : 'none';
                return (
                  <th key={c} scope="col" aria-sort={sorted} className="px-4 py-2 font-semibold text-ink-secondary sm:px-5">
                    <button
                      type="button"
                      onClick={() => toggleSort(c)}
                      className="inline-flex items-center gap-1 rounded-ui-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    >
                      {label(c)}
                      <span aria-hidden="true">{sorted === 'ascending' ? '▲' : sorted === 'descending' ? '▼' : '↕'}</span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={cols.length} className="px-5 py-8 text-center text-ink-secondary">
                  Loading {plural}…
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={cols.length} className="px-5 py-8 text-center text-ink-secondary">
                  {query ? `No ${plural} match “${query}”.` : emptyMessage ?? `No ${plural} yet.`}
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-hairline last:border-b-0 ${onRowClick ? 'cursor-pointer hover:bg-surface' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {cols.map((c, j) =>
                    j === 0 ? (
                      <th key={c} scope="row" className="px-4 py-3 font-medium text-ink sm:px-5">
                        {String(row[c] ?? '')}
                      </th>
                    ) : (
                      <td key={c} className="px-4 py-3 text-ink-secondary sm:px-5">
                        {String(row[c] ?? '')}
                      </td>
                    ),
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-4 py-3 text-sm text-ink-secondary sm:px-5">
        <span aria-live="polite">
          {visible.length} {visible.length === 1 ? entity.toLowerCase() : plural}
          {isSample ? ' · sample data' : ''}
        </span>
        <nav aria-label="Pagination" className="flex items-center gap-2">
          <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} className={`${control} disabled:opacity-60`}>
            Previous
          </button>
          <span>
            Page {current + 1} of {pages}
          </span>
          <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className={`${control} disabled:opacity-60`}>
            Next
          </button>
        </nav>
      </div>
    </section>
  );
}
