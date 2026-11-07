import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface WorkbenchToolbarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function WorkbenchToolbar({ left, center, right, className }: WorkbenchToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Workbench Toolbar"
      className={twMerge(
        'flex h-14 w-full items-center justify-between border-b border-[#272C34] bg-[#111419] px-4 text-xs text-[#F5F7FA] select-none',
        className
      )}
    >
      <div className="flex items-center gap-3">{left}</div>
      <div className="flex items-center gap-2">{center}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

export interface WorkbenchPanelProps {
  side: 'left' | 'right';
  title?: string;
  tabs?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  width?: string;
}

export function WorkbenchPanel({
  side,
  title,
  tabs,
  children,
  className,
  width = side === 'left' ? 'w-[280px]' : 'w-[340px]',
}: WorkbenchPanelProps) {
  return (
    <aside
      aria-label={title || `${side} panel`}
      className={twMerge(
        clsx(
          'flex h-full flex-col bg-[#111419] text-[#F5F7FA] overflow-hidden shrink-0 select-none',
          side === 'left' ? 'border-r border-[#272C34]' : 'border-l border-[#272C34]',
          width,
          className
        )
      )}
    >
      {(title || tabs) && (
        <div className="flex h-10 items-center justify-between border-b border-[#272C34] px-3 shrink-0">
          {title && <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-muted)]">{title}</span>}
          {tabs && <div className="flex items-center gap-1">{tabs}</div>}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3 text-xs">{children}</div>
    </aside>
  );
}

export interface WorkbenchInspectorSectionProps {
  title: string;
  inherited?: boolean;
  onReset?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function WorkbenchInspectorSection({
  title,
  inherited = false,
  onReset,
  children,
  className,
}: WorkbenchInspectorSectionProps) {
  return (
    <div className={twMerge('border-b border-[#272C34] py-3 first:pt-0 last:border-b-0', className)}>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-[#A8AFBA]">{title}</span>
        <div className="flex items-center gap-1.5">
          {inherited ? (
            <span className="text-[10px] text-[var(--text-muted)]">inherited</span>
          ) : (
            <button
              type="button"
              onClick={onReset}
              className="text-[10px] text-[#6782FF] hover:underline cursor-pointer"
            >
              reset
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export interface WorkbenchCommandBarProps {
  value?: string;
  onChange?: (val: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  examples?: string[];
  className?: string;
}

export function WorkbenchCommandBar({
  value = '',
  onChange,
  onSubmit,
  placeholder = 'Tell Tess what to change…',
  examples = ['Keep the chart and rethink everything else', 'Make this section more professional'],
  className,
}: WorkbenchCommandBarProps) {
  return (
    <div
      role="search"
      aria-label="Workbench AI & Structure Command Bar"
      className={twMerge(
        'flex h-16 w-full items-center border-t border-[#272C34] bg-[#111419] px-6 text-xs text-[#F5F7FA]',
        className
      )}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.();
        }}
        className="flex w-full items-center gap-3"
      >
        <span className="text-[#6782FF] font-mono text-sm">✦</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-[#F5F7FA] placeholder:text-[var(--text-muted)] focus:outline-none"
        />
        <div className="hidden md:flex items-center gap-2">
          {examples.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange?.(ex)}
              className="rounded-md border border-[#272C34] bg-[#171B21] px-2 py-1 text-[11px] text-[#A8AFBA] hover:border-[#353C46] hover:text-[#F5F7FA] cursor-pointer"
            >
              {ex}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
