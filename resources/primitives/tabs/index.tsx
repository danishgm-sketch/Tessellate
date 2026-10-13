import React from 'react';

export type TabsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  variant?: TabsVariant;
  tabs?: TabItem[];
  activeId?: string;
  onChange?: (id: string) => void;
}

const defaultTabs: TabItem[] = [
  { id: 'tab1', label: 'Overview', content: 'Overview content' },
  { id: 'tab2', label: 'Details', content: 'Details content' },
];

export function Tabs({ variant = 'quiet', tabs = defaultTabs, activeId = 'tab1', onChange }: TabsProps) {
  const activeTab = tabs.find((t) => t.id === activeId) || tabs[0];

  let borderBottom = 'border-b border-neutral-200';
  let activeIndicator = 'border-neutral-900 text-neutral-900 font-semibold';
  if (variant === 'expressive') {
    borderBottom = 'border-b border-[#D9D6CF]';
    activeIndicator = 'border-[#2547E8] text-[#2547E8] font-semibold';
  } else if (variant === 'nocturne') {
    borderBottom = 'border-b border-[#2E3440]';
    activeIndicator = 'border-white text-white font-semibold';
  }

  return (
    <div className="w-full space-y-4">
      <div className={`flex gap-6 ${borderBottom}`}>
        {tabs.map((tab) => {
          const isSelected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onChange?.(tab.id)}
              className={`pb-2.5 text-sm transition-all border-b-2 -mb-px ${
                isSelected ? activeIndicator : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="text-sm">
        {activeTab?.content}
      </div>
    </div>
  );
}
