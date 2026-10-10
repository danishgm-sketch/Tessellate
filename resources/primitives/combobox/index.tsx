import React, { useState } from 'react';

export type ComboboxVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  variant?: ComboboxVariant;
  label?: string;
  options: ComboboxOption[];
  value?: string;
  onSelect: (val: string) => void;
  placeholder?: string;
}

export function Combobox({
  variant = 'quiet',
  label,
  options,
  value,
  onSelect,
  placeholder = 'Type to search...',
}: ComboboxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
  const selectedOption = options.find((o) => o.value === value);

  let theme = 'border-neutral-300 bg-white text-neutral-900';
  if (variant === 'expressive') theme = 'border-[#D9D6CF] bg-white text-neutral-900 shadow-2xs';
  if (variant === 'nocturne') theme = 'border-[#2E3440] bg-[#11141B] text-white';

  return (
    <div className="relative w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</label>}
      <div className={`flex items-center rounded-lg border px-3 py-2 text-sm ${theme}`}>
        <input
          type="text"
          className="w-full bg-transparent outline-none text-sm placeholder:text-neutral-400"
          value={open ? query : selectedOption?.label || query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
        />
        <button type="button" onClick={() => setOpen(!open)} className="text-xs opacity-50 ml-1">
          {open ? '▲' : '▼'}
        </button>
      </div>
      {open && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-neutral-200 bg-white dark:bg-[#11141B] dark:border-neutral-800 p-1 shadow-lg">
          {filtered.length === 0 ? (
            <p className="p-2 text-xs text-neutral-400">No results found</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="w-full rounded px-2.5 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => {
                  onSelect(opt.value);
                  setQuery(opt.label);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
