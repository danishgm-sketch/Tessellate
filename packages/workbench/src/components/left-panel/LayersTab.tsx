import React, { useState } from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { createId, type ProjectManifest, type ProjectMutation, type ProjectNode, type ProjectScreen } from '@tessellate/schemas';
import { createHistoryOperation } from '../../history/history-manager.js';
import { cloneNodeWithNewIds, findNodeById, findParentNode } from '../../utils/tree-helpers.js';
import { isScopeLocked } from '../../utils/dna-helpers.js';
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  ChevronDown,
  Copy,
  Lock,
  Unlock,
  Layers,
  Box,
  Component,
  Layout,
  Type,
  Sparkles,
  Trash2,
} from 'lucide-react';

function executeTreeMutation(mutation: ProjectMutation, summary: string) {
  useWorkbenchStore.getState().executeOperation(
    createHistoryOperation(summary, [mutation], 'user', [mutation.targetId])
  );
}

function createMutation<T extends ProjectMutation['type']>(manifest: ProjectManifest, type: T, targetId: string, payload: Extract<ProjectMutation, { type: T }>['payload']): Extract<ProjectMutation, { type: T }> {
  return {
    id: createId('mutation'),
    type,
    targetId,
    payload,
    actor: 'user',
    timestamp: new Date().toISOString(),
    preconditionRevision: manifest.historyMeta.headRevision,
  } as Extract<ProjectMutation, { type: T }>;
}

function SelectedLayerActions({ screen, node }: { screen: ProjectScreen; node: ProjectNode }) {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const selectNode = useWorkbenchStore((state) => state.selectNode);
  const parent = findParentNode(screen.rootNode, node.id);
  const parentId = parent?.parent.id;
  const siblings = parent?.parent.children ?? [];
  const index = parent?.index ?? -1;
  const isRoot = node.id === screen.rootNode.id;
  const locked = isScopeLocked(manifest, screen.id, node.id, 'structure');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const label = String(node.props?.title ?? node.props?.label ?? node.semanticRole ?? node.id);

  const duplicate = () => {
    if (!parentId || locked) return;
    const copy = cloneNodeWithNewIds(node, createId('node'));
    const mutation = createMutation(manifest, 'INSERT_NODE', parentId, {
      parentId,
      node: copy,
      index: index + 1,
    });
    executeTreeMutation(mutation, `Duplicated ${label}`);
    selectNode(copy.id);
  };

  const move = (direction: -1 | 1) => {
    if (!parentId || locked) return;
    const mutation = createMutation(manifest, 'MOVE_NODE', node.id, {
      nodeId: node.id,
      newParentId: parentId,
      index: index + direction,
    });
    executeTreeMutation(mutation, `Moved ${label} ${direction < 0 ? 'up' : 'down'}`);
  };

  const remove = () => {
    if (!parentId || locked) return;
    const mutation = createMutation(manifest, 'DELETE_NODE', node.id, { nodeId: node.id });
    executeTreeMutation(mutation, `Deleted ${label}`);
    selectNode(parentId);
    setConfirmDelete(false);
  };

  const disabledReason = isRoot
    ? 'The screen root stays in place. Duplicate the screen from Pages.'
    : locked
      ? 'Unlock this node and its ancestors before changing its structure.'
      : '';

  return (
    <section aria-label="Selected layer actions" className="space-y-2 rounded-lg border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#111419] p-2.5">
      <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">Selected: {label}</div>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" data-testid="duplicate-layer" disabled={!parentId || locked} title={disabledReason || 'Duplicate selected layer'} onClick={duplicate} className="inline-flex min-h-8 items-center gap-1 rounded border border-[#D9D6CF] dark:border-[#272C34] px-2 text-[11px] disabled:opacity-40">
          <Copy className="h-3 w-3" /> Duplicate
        </button>
        <button type="button" aria-label="Move selected layer up" disabled={!parentId || locked || index <= 0} title={disabledReason || (index <= 0 ? 'This layer is already first among its siblings.' : 'Move selected layer up')} onClick={() => move(-1)} className="inline-flex min-h-8 items-center gap-1 rounded border border-[#D9D6CF] dark:border-[#272C34] px-2 text-[11px] disabled:opacity-40">
          <ArrowUp className="h-3 w-3" /> Move up
        </button>
        <button type="button" aria-label="Move selected layer down" disabled={!parentId || locked || index < 0 || index >= siblings.length - 1} title={disabledReason || (index >= siblings.length - 1 ? 'This layer is already last among its siblings.' : 'Move selected layer down')} onClick={() => move(1)} className="inline-flex min-h-8 items-center gap-1 rounded border border-[#D9D6CF] dark:border-[#272C34] px-2 text-[11px] disabled:opacity-40">
          <ArrowDown className="h-3 w-3" /> Move down
        </button>
        {!confirmDelete ? (
          <button type="button" data-testid="delete-layer" disabled={!parentId || locked} title={disabledReason || 'Delete selected layer'} onClick={() => setConfirmDelete(true)} className="inline-flex min-h-8 items-center gap-1 rounded border border-rose-300 dark:border-rose-900 px-2 text-[11px] text-rose-700 dark:text-rose-300 disabled:opacity-40">
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        ) : (
          <div role="group" aria-label={`Confirm deleting ${label}`} className="flex items-center gap-1.5">
            <span className="text-[11px]">Delete this layer and its children?</span>
            <button type="button" data-testid="confirm-delete-layer" onClick={remove} className="min-h-8 rounded bg-rose-700 px-2 text-[11px] font-semibold text-white">Delete layer</button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="min-h-8 rounded border border-[#D9D6CF] dark:border-[#272C34] px-2 text-[11px]">Cancel</button>
          </div>
        )}
      </div>
      {disabledReason && <p role="status" className="text-[10px] text-[var(--text-muted)]">{disabledReason}</p>}
      {locked && <p role="status" className="text-[10px] text-[var(--text-muted)]">This node or an ancestor is locked against structural changes.</p>}
    </section>
  );
}

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
        role="treeitem" tabIndex={0} aria-selected={isSelected}
        onKeyDown={event=>{if(event.key==='Enter' || event.key===' '){event.preventDefault();event.stopPropagation();selectNode(node.id);}}}
        onClick={(e) => {
          e.stopPropagation();
          selectNode(node.id);
        }}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
        className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition-all ${
          isSelected
            ? 'bg-[#E7EBFF] dark:bg-[#1C2752] text-[#2547E8] dark:text-[#879DFF] font-semibold'
            : isHovered
            ? 'bg-[#FAF9F6] dark:bg-[#171B21] text-[#111217] dark:text-[#F5F7FA]'
            : 'text-[#62666F] dark:text-[#A8AFBA] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21]'
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          {hasChildren ? (
            <button
              aria-label={`${isExpanded ? "Collapse" : "Expand"} ${displayName}`} aria-expanded={isExpanded}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="min-h-6 min-w-6 p-1 hover:text-[#111217] dark:hover:text-[#F5F7FA]"
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
            <span className="text-[10px] text-[var(--text-muted)] font-mono truncate">
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
              toggleNodeLock(node.id, 'node');
            }}
            aria-label={`${isLocked ? 'Unlock' : 'Lock'} ${displayName}`} aria-pressed={isLocked} title={isLocked ? 'Node Locked' : 'Lock Node'}
            className={`min-h-6 min-w-6 p-1 rounded transition-opacity ${
              isLocked
                ? 'opacity-100 text-amber-500'
                : 'opacity-40 hover:opacity-100 text-[var(--text-muted)]'
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
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);

  const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);
  if (!activeScreen) {
    return (
      <div className="p-4 text-xs text-[var(--text-muted)]">
        No active screen selected.
      </div>
    );
  }

  return (
    <div data-testid="layers-tab" className="p-3 space-y-2">
      <div className="flex items-center justify-between px-2 pb-1 border-b border-[#D9D6CF] dark:border-[#272C34]">
        <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
          Semantic Tree ({activeScreen.name})
        </span>
      </div>

      <div role="tree" aria-label="Semantic layers" className="space-y-0.5 overflow-y-auto max-h-[calc(100vh-200px)]">
        <LayerNodeItem node={activeScreen.rootNode} depth={0} />
      </div>
      {selectedNodeId && findNodeById(activeScreen.rootNode, selectedNodeId) && (
        <SelectedLayerActions key={`${activeScreen.id}:${selectedNodeId}`} screen={activeScreen} node={findNodeById(activeScreen.rootNode, selectedNodeId)!} />
      )}
    </div>
  );
}
