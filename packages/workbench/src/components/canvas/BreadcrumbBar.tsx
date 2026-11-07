import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { getNodePath } from '../../utils/tree-helpers.js';
import { ChevronRight, Home, Lock } from 'lucide-react';

export function BreadcrumbBar() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const selectNode = useWorkbenchStore((state) => state.selectNode);

  const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);
  if (!activeScreen) return null;

  const path = selectedNodeId
    ? getNodePath(activeScreen.rootNode, selectedNodeId)
    : [];

  return (
    <div
      data-testid="breadcrumb-bar"
      className="dark flex flex-wrap items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-white/80 dark:bg-[#111217]/80 backdrop-blur-md rounded-lg border border-[#D9D6CF] dark:border-[#272C34] shadow-sm text-[#62666F] dark:text-[#A8AFBA]"
    >
      <button
        onClick={() => selectNode(null)}
        className="flex items-center gap-1 hover:text-[#111217] dark:hover:text-[#F5F7FA] transition-colors"
        title="Screen Root"
      >
        <Home className="h-3 w-3" />
        <span>{activeScreen.name}</span>
      </button>

      {path.map((node, index) => {
        const isLast = index === path.length - 1;
        const displayName =
          (node.props?.title as string) ||
          (node.props?.label as string) ||
          node.semanticRole ||
          node.nodeType;

        const isLocked = Boolean(node.locks && Object.values(node.locks).some(Boolean));

        return (
          <React.Fragment key={node.id}>
            <ChevronRight className="h-3 w-3 opacity-40 shrink-0" />
            <button
              onClick={() => selectNode(node.id)}
              className={`flex items-center gap-1 transition-colors ${
                isLast
                  ? 'font-bold text-[#2547E8] dark:text-[#879DFF]'
                  : 'hover:text-[#111217] dark:hover:text-[#F5F7FA]'
              }`}
            >
              <span>{displayName}</span>
              {isLocked && <Lock className="h-2.5 w-2.5 opacity-60 text-amber-500" />}
            </button>
          </React.Fragment>
        );
      })}

      {selectedNodeId && (
        <span className="ml-2 text-[10px] text-[var(--text-muted)] hidden sm:inline">
          (Esc to climb)
        </span>
      )}
    </div>
  );
}
