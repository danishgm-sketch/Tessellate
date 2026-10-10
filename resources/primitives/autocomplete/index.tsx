import React, { useState } from 'react';

export type AutocompleteVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AutocompleteProps {
  variant?: AutocompleteVariant;
  label?: string;
  suggestions: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function Autocomplete({
  variant = 'quiet',
  label,
  suggestions,
  value,
  onChange,
  placeholder = 'Type something...',
}: AutocompleteProps) {
  const [active, setActive] = useState(false);
  const matches = suggestions.filter((s) => s.toLowerCase().startsWith(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase());

  let theme = 'border-neutral-300 bg-white text-neutral-900';
  if (variant === 'expressive') theme = 'border-[#D9D6CF] bg-white text-neutral-900 shadow-2xs';
  if (variant === 'nocturne') theme = 'border-[#2E3440] bg-[#11141B] text-white';

  return (
    <div className="relative w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</label>}
      <input
        type="text"
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${theme}`}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setActive(true);
        }}
        onFocus={() => setActive(true)}
        placeholder={placeholder}
      />
      {active && matches.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-lg border border-neutral-200 bg-white dark:bg-[#11141B] dark:border-neutral-800 p-1 shadow-md">
          {matches.map((item) => (
            <li key={item}>
              <button
                type="button"
                className="w-full rounded px-2.5 py-1 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => {
                  onChange(item);
                  setActive(false);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
