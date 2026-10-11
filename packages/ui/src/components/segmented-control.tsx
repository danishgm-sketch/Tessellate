import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  name?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      className={twMerge(
        clsx(
          'inline-flex h-7 items-center rounded-lg bg-[#ECE9E2] p-0.5 text-xs font-medium dark:bg-[#1C2128]',
          className
        )
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={clsx(
              'h-6 rounded-md px-2.5 transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2547E8]',
              isSelected
                ? 'bg-[#FFFFFF] text-[#111217] shadow-xs font-semibold dark:bg-[#111419] dark:text-[#F5F7FA]'
                : 'text-[#62666F] hover:text-[#111217] dark:text-[#A8AFBA] dark:hover:text-[#F5F7FA]'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
