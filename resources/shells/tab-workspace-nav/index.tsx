import React, { useState } from 'react';

export type TabWorkspaceNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TabWorkspaceNavProps {
  variant?: TabWorkspaceNavVariant;
  activeId?: string;
  defaultActiveId?: string;
  onSelectTab?: (id: string) => void;
  onCloseTab?: (id: string) => void;
}

const INITIAL_TABS = [
  { id: '1', name: 'Dashboard.tsx' },
  { id: '2', name: 'tokens.css' },
  { id: '3', name: 'schema.json' },
];

export function TabWorkspaceNav({
  variant = 'quiet',
  activeId,
  defaultActiveId = '1',
  onSelectTab,
  onCloseTab,
}: TabWorkspaceNavProps) {
  const [openTabs, setOpenTabs] = useState(INITIAL_TABS);
  const [uncontrolledId, setUncontrolledId] = useState(defaultActiveId);
  const selectedId = activeId ?? uncontrolledId;

  let bar = 'bg-neutral-100 border-b border-neutral-200 text-neutral-800';
  let activeTab = 'bg-white text-neutral-900 border-r border-l border-neutral-200 font-semibold';
  if (variant === 'nocturne') {
    bar = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';
    activeTab = 'bg-[#11141B] text-white border-r border-l border-[#2E3440] font-semibold';
  }

  return (
    <nav aria-label="Workspace file tabs" className={`w-full flex items-center h-10 px-2 overflow-x-auto text-xs ${bar}`}>
      {openTabs.length === 0 ? (
        <button
          type="button"
          onClick={() => {
            setOpenTabs(INITIAL_TABS);
            if (activeId === undefined) {
              setUncontrolledId(defaultActiveId);
            }
          }}
          className="px-3 py-1 rounded border text-xs font-medium"
        >
          Restore example tabs
        </button>
      ) : (
        openTabs.map((t) => {
          const isCurrent = t.id === selectedId;
          return (
            <div
              key={t.id}
              className={`h-full flex items-center gap-1 px-2 ${
                isCurrent ? activeTab : 'opacity-80 hover:opacity-100'
              }`}
            >
              <button
                type="button"
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => {
                  if (activeId === undefined) {
                    setUncontrolledId(t.id);
                  }
                  onSelectTab?.(t.id);
                }}
                className="px-1.5 py-1 rounded text-xs"
              >
                {t.name}
              </button>
              <button
                type="button"
                aria-label={`Close ${t.name}`}
                onClick={() => {
                  const nextTabs = openTabs.filter((item) => item.id !== t.id);
                  setOpenTabs(nextTabs);
                  if (activeId === undefined && t.id === selectedId && nextTabs[0]) {
                    setUncontrolledId(nextTabs[0].id);
                  }
                  onCloseTab?.(t.id);
                }}
                className="px-1 py-0.5 rounded opacity-75 hover:opacity-100 text-xs"
              >
                ✕
              </button>
            </div>
          );
        })
      )}
    </nav>
  );
}
