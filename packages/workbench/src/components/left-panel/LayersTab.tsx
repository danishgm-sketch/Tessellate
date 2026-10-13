import React, { useState } from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import type { ProjectNode } from '@tessellate/schemas';
import {
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  Layers,
  Box,
  Component,
  Layout,
  Type,
  Sparkles,
} from 'lucide-react';

interface LayerNodeItemProps {
  node: ProjectNode;
  depth: number;
}

function LayerNodeItem({ node, depth }: LayerNodeItemProps) {
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const hoveredNodeId = useWorkbenchStore((state) => state.hoveredNodeId);
  const selectNode = useWorkbenchStore((state) => state.selectNode);
  const setHoveredNode = useWorkbenchStore((state) => state.setHoveredNode);
  const toggleNodeLock = useWorkbenchStore((state) => state.toggleNodeLock);

  const [isExpanded, setIsExpanded] = useState(true);

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const isLocked = Boolean(node.locks && Object.values(node.locks).some(Boolean));
  const hasDnaOverrides = Boolean(
    node.dnaOverrides && Object.keys(node.dnaOverrides).length > 0
  );

  const getNodeIcon = () => {
    switch (node.nodeType) {
      case 'layout':
        return <Layout className="h-3 w-3 text-indigo-500 shrink-0" />;
      case 'section':
        return <Layers className="h-3 w-3 text-blue-500 shrink-0" />;
      case 'component':
        return <Component className="h-3 w-3 text-purple-500 shrink-0" />;
      case 'block':
        return <Box className="h-3 w-3 text-emerald-500 shrink-0" />;
      case 'element':
        return <Type className="h-3 w-3 text-amber-500 shrink-0" />;
      default:
        return <Box className="h-3 w-3 text-neutral-400 shrink-0" />;
    }
  };

  const displayName =
    (node.props?.title as string) ||
    (node.props?.label as string) ||
    node.semanticRole ||
    node.id;

  return (
    <div className="select-none">
      <div
        data-testid={`layer-node-${node.id}`}
        onClick={(e) => {
          e.stopPropagation();
          selectNode(node.id);
        }}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
        className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition-all ${
          isSelected
            ? 'bg-[#E7EBFF] dark:bg-[#1C2752] text-[#2547E8] dark:text-[#6782FF] font-semibold'
            : isHovered
            ? 'bg-[#FAF9F6] dark:bg-[#171B21] text-[#111217] dark:text-[#F5F7FA]'
            : 'text-[#62666F] dark:text-[#A8AFBA] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21]'
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-0.5 hover:text-[#111217] dark:hover:text-[#F5F7FA]"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}

          {getNodeIcon()}

          <span className="truncate text-xs">{displayName}</span>

          {hasDnaOverrides && (
            <span
              title="Has local DNA overrides"
              className="rounded bg-violet-100 dark:bg-violet-950/60 px-1 text-[9px] font-bold text-violet-700 dark:text-violet-300 flex items-center gap-0.5"
            >
              <Sparkles className="h-2 w-2" />
              DNA
            </span>
          )}

          {node.resourceRef && (
            <span className="text-[10px] text-[#8B8F97] font-mono opacity-60 truncate">
              {node.resourceRef.slug}
            </span>
          )}
        </div>

        {/* Lock Toggle Action */}
        <div className="flex items-center gap-1">
          <button
            data-testid={`toggle-lock-${node.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleNodeLock(node.id, 'structure');
            }}
            title={isLocked ? 'Node Locked' : 'Lock Node'}
            className={`p-1 rounded transition-opacity ${
              isLocked
                ? 'opacity-100 text-amber-500'
                : 'opacity-40 hover:opacity-100 text-[#8B8F97]'
            }`}
          >
            {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {node.children.map((child) => (
            <LayerNodeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function LayersTab() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);

  const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);
  if (!activeScreen) {
    return (
      <div className="p-4 text-xs text-[#8B8F97]">
        No active screen selected.
      </div>
    );
  }

  return (
    <div data-testid="layers-tab" className="p-3 space-y-2">
      <div className="flex items-center justify-between px-2 pb-1 border-b border-[#D9D6CF] dark:border-[#272C34]">
        <span className="text-[10px] uppercase font-mono tracking-wider text-[#8B8F97]">
          Semantic Tree ({activeScreen.name})
        </span>
      </div>

      <div className="space-y-0.5 overflow-y-auto max-h-[calc(100vh-200px)]">
        <LayerNodeItem node={activeScreen.rootNode} depth={0} />
      </div>
    </div>
  );
}
