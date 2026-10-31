import React from 'react';

export type BreadcrumbHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BreadcrumbHeaderItem {
  label: string;
  href?: string;
}

export interface BreadcrumbHeaderProps {
  variant?: BreadcrumbHeaderVariant;
  items?: BreadcrumbHeaderItem[];
  onExport?: () => void;
  onSave?: () => void;
}

const defaultItems: BreadcrumbHeaderItem[] = [{ label: 'Projects' }, { label: 'Telemetry' }, { label: 'Analytics Node' }];

export function BreadcrumbHeader({ variant = 'quiet', items = defaultItems, onExport, onSave }: BreadcrumbHeaderProps) {
  let header = 'bg-white border-b border-neutral-200 text-neutral-900';
  if (variant === 'nocturne') header = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';

  return (
    <div className={`w-full min-h-14 px-3 py-2 sm:px-6 flex flex-wrap items-center justify-between gap-2 text-xs ${header}`}>
      <div className="min-w-0 flex items-center gap-2">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            {items.map((item, index) => {
              const current = index === items.length - 1;
              return (
                <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                  {item.href && !current ? <a href={item.href} className="opacity-50 hover:opacity-100">{item.label}</a> : <span className={current ? 'font-semibold' : 'opacity-50'} aria-current={current ? 'page' : undefined}>{item.label}</span>}
                  {!current && <span className="opacity-30" aria-hidden="true">/</span>}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button type="button" onClick={onExport} disabled={!onExport} aria-describedby={!onExport ? 'breadcrumb-header-export-help' : undefined} className="px-3 py-1.5 border rounded-lg disabled:cursor-not-allowed disabled:opacity-60">Export</button>
        <button type="button" onClick={onSave} disabled={!onSave} aria-describedby={!onSave ? 'breadcrumb-header-save-help' : undefined} className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-medium rounded-lg disabled:cursor-not-allowed disabled:opacity-60">Save</button>
      </div>
      {!onExport && <span id="breadcrumb-header-export-help" className="sr-only">Connect an export action before enabling this button.</span>}
      {!onSave && <span id="breadcrumb-header-save-help" className="sr-only">Connect a save action before enabling this button.</span>}
    </div>
  );
}
