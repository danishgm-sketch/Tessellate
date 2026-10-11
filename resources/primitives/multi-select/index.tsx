import React, { useState } from 'react';

export type MultiSelectVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MultiSelectProps {
  variant?: MultiSelectVariant;
  label?: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelect({
  variant = 'quiet',
  label,
  options,
  selected,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  let theme = 'border-neutral-300 bg-white text-neutral-900';
  let pill = 'bg-neutral-100 text-neutral-800';
  if (variant === 'expressive') {
    theme = 'border-[#D9D6CF] bg-white text-neutral-900 shadow-2xs';
    pill = 'bg-[#E7EBFF] text-[#2547E8] font-medium';
  } else if (variant === 'nocturne') {
    theme = 'border-[#2E3440] bg-[#11141B] text-white';
    pill = 'bg-[#1E232E] text-neutral-200 border border-neutral-700';
  }

  return (
    <div className="relative w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</label>}
      <div
        className={`flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border p-1.5 cursor-pointer ${theme}`}
        onClick={() => setOpen(!open)}
      >
        {selected.length === 0 && <span className="text-xs text-neutral-400 px-1">Select items...</span>}
        {selected.map((item) => (
          <span key={item} className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ${pill}`}>
            {item}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggle(item);
              }}
              className="hover:opacity-75"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      {open && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-neutral-200 bg-white dark:bg-[#11141B] dark:border-neutral-800 p-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`w-full rounded px-2.5 py-1.5 text-left text-sm flex justify-between ${
                selected.includes(opt) ? 'font-semibold bg-neutral-50 dark:bg-neutral-800' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              onClick={() => toggle(opt)}
            >
              <span>{opt}</span>
              {selected.includes(opt) && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
