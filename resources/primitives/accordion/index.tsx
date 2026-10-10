import React, { useState } from 'react';

export type AccordionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  variant?: AccordionVariant;
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function Accordion({ variant = 'quiet', items, allowMultiple = false }: AccordionProps) {
  const [expanded, setExpanded] = useState<string[]>([items[0]?.id || '']);

  const toggle = (id: string) => {
    if (expanded.includes(id)) {
      setExpanded(allowMultiple ? expanded.filter((i) => i !== id) : []);
    } else {
      setExpanded(allowMultiple ? [...expanded, id] : [id]);
    }
  };

  let theme = 'border-neutral-200 divide-neutral-200';
  if (variant === 'expressive') theme = 'border-[#D9D6CF] divide-[#D9D6CF]';
  if (variant === 'nocturne') theme = 'border-[#2E3440] divide-[#2E3440] text-white';

  return (
    <div className={`w-full rounded-lg border divide-y overflow-hidden ${theme}`}>
      {items.map((item) => {
        const isOpen = expanded.includes(item.id);
        return (
          <div key={item.id} className="text-sm">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            >
              <span>{item.title}</span>
              <span className={`transition-transform duration-200 text-xs ${isOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {isOpen && <div className="p-4 pt-0 text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
