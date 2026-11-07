import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface MenuProps {
  trigger: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  items: MenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Menu({ trigger, items, align = 'right', className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </div>
      {open && (
        <div
          role="menu"
          className={twMerge(
            clsx(
              'absolute z-50 mt-1 min-w-[180px] rounded-xl border border-[#D9D6CF] bg-[#FFFFFF] p-1.5 shadow-lg animate-in fade-in-0 ' +
                'dark:border-[#272C34] dark:bg-[#111419]',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setOpen(false);
                }
              }}
              className={clsx(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-left focus:outline-none focus:bg-[#ECE9E2] dark:focus:bg-[#1C2128]',
                item.destructive
                  ? 'text-[#C83D48] hover:bg-[#C83D48]/10'
                  : 'text-[#111217] hover:bg-[#ECE9E2] dark:text-[#F5F7FA] dark:hover:bg-[#1C2128]',
                item.disabled && 'opacity-50 pointer-events-none'
              )}
            >
              {item.icon && <span className="text-[var(--text-muted)]">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
