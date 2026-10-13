import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, activeId, onChange, className }: TabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % items.length;
      const nextItem = items[nextIndex];
      if (nextItem) onChange(nextItem.id);
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + items.length) % items.length;
      const prevItem = items[prevIndex];
      if (prevItem) onChange(prevItem.id);
    }
  };

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={twMerge('flex border-b border-[#D9D6CF] dark:border-[#272C34] gap-6', className)}
    >
      {items.map((tab, idx) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={clsx(
              'relative py-3 text-sm font-medium transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2547E8] rounded-t-sm',
              isActive
                ? 'text-[#111217] dark:text-[#F5F7FA]'
                : 'text-[#62666F] hover:text-[#111217] dark:text-[#707986] dark:hover:text-[#F5F7FA]'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1.5 rounded-full bg-[#ECE9E2] px-1.5 py-0.5 text-xs text-[#62666F] dark:bg-[#1C2128] dark:text-[#A8AFBA]">
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2547E8] dark:bg-[#6782FF]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
