import React, { useState } from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { cloneNodeWithNewIds } from '../../utils/tree-helpers.js';
import { createId, type ProjectScreen } from '@tessellate/schemas';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
} from 'lucide-react';

function routeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'screen';
}

function normalizeScreenSlug(value: string, fallbackName: string) {
  const source = value.trim() || fallbackName;
  const segments = source.split('/').filter(Boolean).map(routeSegment);
  return segments.length > 0 ? `/${segments.join('/')}` : `/${routeSegment(fallbackName)}`;
}

function duplicateScreenIdentity(screen: ProjectScreen, screens: ProjectScreen[]) {
  const usedNames = new Set(screens.map((item) => item.name.toLowerCase()));
  const usedSlugs = new Set(screens.map((item) => item.slug.replace(/\/+$/, '').toLowerCase()));
  const routeBase = normalizeScreenSlug(screen.slug, screen.name);
  let copyNumber = 1;
  let name = '';
  let slug = '';

  do {
    const suffix = copyNumber === 1 ? '' : ` ${copyNumber}`;
    const routeSuffix = copyNumber === 1 ? '' : `-${copyNumber}`;
    name = `${screen.name} (Copy${suffix})`;
    slug = `${routeBase}-copy${routeSuffix}`;
    copyNumber += 1;
  } while (usedNames.has(name.toLowerCase()) || usedSlugs.has(slug.toLowerCase()));

  return { id: createId('screen'), name, slug };
}

export function PagesTab() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const setActiveScreen = useWorkbenchStore((state) => state.setActiveScreen);
  const addScreen = useWorkbenchStore((state) => state.addScreen);
  const deleteScreen = useWorkbenchStore((state) => state.deleteScreen);

  const [isAdding, setIsAdding] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenSlug, setNewScreenSlug] = useState('');
  const [screenFormError, setScreenFormError] = useState<string | null>(null);

  const handleCreateScreen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScreenName.trim()) return;

    const slug = normalizeScreenSlug(newScreenSlug, newScreenName);
    const routeKey = slug.toLowerCase();
    if (manifest.screens.some((screen) => normalizeScreenSlug(screen.slug, screen.name).toLowerCase() === routeKey)) {
      setScreenFormError(`The route ${slug} is already used by another screen. Choose a different route.`);
      return;
    }

    const newId = createId('screen');
    const newScreen: ProjectScreen = {
      id: newId,
      screenNodeId: newId,
      name: newScreenName.trim(),
      slug,
      rootNode: {
        id: `node-${newId}-root`,
        nodeType: 'layout',
        semanticRole: 'app-shell',
        props: {
          className: 'w-full min-h-screen flex flex-col p-6 bg-[var(--tess-canvas,#FAF9F6)] text-[var(--tess-ink,#111217)]',
        },
        slots: {},
        children: [
          {
            id: `node-${newId}-heading`,
            nodeType: 'element',
            semanticRole: 'heading',
            props: {
              children: newScreenName.trim(),
              className: 'text-2xl font-bold mb-4',
            },
            slots: {},
            children: [],
          },
        ],
      },
    };

    addScreen(newScreen);
    setNewScreenName('');
    setNewScreenSlug('');
    setScreenFormError(null);
    setIsAdding(false);
  };

  const handleDuplicate = (screen: ProjectScreen) => {
    const identity = duplicateScreenIdentity(screen, manifest.screens);
    const duplicated: ProjectScreen = {
      ...screen,
      id: identity.id,
      screenNodeId: identity.id,
      name: identity.name,
      slug: identity.slug,
      rootNode: cloneNodeWithNewIds(screen.rootNode, identity.id),
    };
    addScreen(duplicated);
  };

  return (
    <div data-testid="pages-tab" className="p-4 space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
          Screens & Navigation ({manifest.screens.length})
        </span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 rounded bg-[#2547E8] dark:bg-[#6782FF] px-2 py-1 text-[11px] font-semibold text-white dark:text-[#0B0D10] hover:opacity-90"
        >
          <Plus className="h-3 w-3" />
          <span>Add Page</span>
        </button>
      </div>

      {/* Add Page Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateScreen}
          className="rounded-xl border border-[#2547E8] bg-white dark:bg-[#171B21] p-3 space-y-2 shadow-xs"
        >
          <div className="text-xs font-bold text-[#111217] dark:text-[#F5F7FA]">
            Create New Screen
          </div>
          <input
            type="text"
            aria-label="Page title" placeholder="Page title"
            value={newScreenName}
            onChange={(e) => { setNewScreenName(e.target.value); setScreenFormError(null); }}
            className="w-full rounded border border-[#D9D6CF] dark:border-[#272C34] bg-[#FAF9F6] dark:bg-[#0B0D10] px-2 py-1 text-xs"
            autoFocus
          />
          <input
            type="text"
            aria-label="Route slug" placeholder="Route slug"
            value={newScreenSlug}
            onChange={(e) => { setNewScreenSlug(e.target.value); setScreenFormError(null); }}
            className="w-full rounded border border-[#D9D6CF] dark:border-[#272C34] bg-[#FAF9F6] dark:bg-[#0B0D10] px-2 py-1 text-xs font-mono"
          />
          {screenFormError && <p role="alert" className="text-[11px] text-rose-700 dark:text-rose-300">{screenFormError}</p>}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2 py-1 text-[11px] text-[#62666F] dark:text-[#A8AFBA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-[#2547E8] px-3 py-1 text-[11px] font-semibold text-white"
            >
              Add Screen
            </button>
          </div>
        </form>
      )}

      {/* Screen List */}
      <div className="space-y-1.5">
        {manifest.screens.map((screen) => {
          const isActive = screen.id === activeScreenId;
          const graphNode = manifest.screenGraph.groups
            .flatMap((g) => g.screens)
            .find((s) => s.id === screen.screenNodeId || s.id === screen.id);

          return (
            <div
              key={screen.id}
              className={`group flex items-center justify-between rounded-xl border p-2.5 cursor-pointer transition-all ${
                isActive
                  ? 'border-[#2547E8] bg-white dark:border-[#6782FF] dark:bg-[#171B21] shadow-xs'
                  : 'border-[#D9D6CF] bg-[#FAF9F6] hover:bg-white dark:border-[#272C34] dark:bg-[#0B0D10] dark:hover:bg-[#171B21]'
              }`}
            >
              <button type="button" aria-label={`Select screen ${screen.name}`} aria-pressed={isActive} onClick={()=>setActiveScreen(screen.id)} className="min-w-0 flex-1 flex items-center gap-2.5 overflow-hidden text-left rounded focus-visible:outline-2 focus-visible:outline-[#879DFF]">
                <FileText
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-[#2547E8] dark:text-[#879DFF]' : 'text-[var(--text-muted)]'
                  }`}
                />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#111217] dark:text-[#F5F7FA] truncate">
                      {screen.name}
                    </span>
                    {graphNode?.required && (
                      <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-1 py-0.2 text-[9px] font-bold text-emerald-800 dark:text-emerald-300">
                        Req
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                    {screen.slug}
                  </div>
                </div>
              </button>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(screen);
                  }}
                  aria-label={`Duplicate ${screen.name}`} title="Duplicate screen"
                  className="min-h-6 min-w-6 p-1.5 text-[var(--text-muted)] hover:text-[#111217] dark:hover:text-[#F5F7FA]"
                >
                  <Copy className="h-3 w-3" />
                </button>
                {manifest.screens.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScreen(screen.id);
                    }}
                    aria-label={`Delete ${screen.name}`} title="Delete screen"
                    className="min-h-6 min-w-6 p-1.5 text-[var(--text-muted)] hover:text-rose-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
