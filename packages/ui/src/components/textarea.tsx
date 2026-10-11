import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 3, ...props }, ref) => {
    const baseStyles =
      'w-full rounded-[10px] border border-[#D9D6CF] bg-[#FFFFFF] p-3 text-sm text-[#111217] transition-colors ' +
      'placeholder:text-[#8B8F97] ' +
      'focus:border-[#2547E8] focus:outline-none focus:ring-2 focus:ring-[#2547E8]/20 ' +
      'disabled:cursor-not-allowed disabled:bg-[#ECE9E2] disabled:opacity-60 ' +
      'dark:border-[#272C34] dark:bg-[#111419] dark:text-[#F5F7FA] dark:placeholder:text-[#707986] ' +
      'dark:focus:border-[#6782FF] dark:focus:ring-[#6782FF]/20';

    return (
      <textarea
        ref={ref}
        rows={rows}
        className={twMerge(clsx(baseStyles, className))}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
