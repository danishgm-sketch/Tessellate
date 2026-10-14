import React, { useEffect, useState } from 'react';
import { useWorkbenchStore } from '../store/workbench-store.js';
import { TopToolbar } from './TopToolbar.js';
import { LeftPanel } from './left-panel/LeftPanel.js';
import { WorkbenchCanvas } from './canvas/WorkbenchCanvas.js';
import { RightInspector } from './right-inspector/RightInspector.js';
import { CommandBar } from './CommandBar.js';
import { MobileWorkbench } from './mobile/MobileWorkbench.js';
import { PreviewModal } from './preview/PreviewModal.js';
import { CompareModal } from './compare/CompareModal.js';
import { BlendModal } from './blend/BlendModal.js';
import { ReplaceDrawer } from './replace/ReplaceDrawer.js';
import { useLibraryStore } from '../store/library-store.js';
import { AuditPanel } from './audit/AuditPanel.js';
import { listLocalCheckpoints, loadLocalProject, newProjectId, saveLocalProject } from '../persistence/storage.js';
import { safelyLoadProjectRecord, type CorruptedProjectRecovery } from '../persistence/recovery.js';
import { startProjectAutosave } from '../persistence/autosave.js';
import { ProjectsDashboard } from './projects/ProjectsDashboard.js';
import { ProjectNotFound, ProjectRecovery } from './projects/ProjectRecovery.js';

type ShellView =
  | { kind: 'loading' }
  | { kind: 'dashboard' }
  | { kind: 'editor' }
  | { kind: 'not-found'; projectId: string }
  | { kind: 'corrupted'; projectId: string; recovery: CorruptedProjectRecovery }
  | { kind: 'error'; message: string };

export function WorkbenchShell() {
  const activeMode = useWorkbenchStore((state) => state.activeMode);
  const isPreview = useWorkbenchStore((state) => state.isPreview);
  const selectParentNode = useWorkbenchStore((state) => state.selectParentNode);
  const undo = useWorkbenchStore((state) => state.undo);
  const redo = useWorkbenchStore((state) => state.redo);
  const setDevicePreset = useWorkbenchStore((state) => state.setDevicePreset);
  const setZoom = useWorkbenchStore((state) => state.setZoom);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const toggleNodeLock = useWorkbenchStore((state) => state.toggleNodeLock);
  const openReplaceDrawer = useWorkbenchStore((state) => state.openReplaceDrawer);

  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const openProject = useWorkbenchStore((state) => state.openProject);
  const [view, setView] = useState<ShellView>({ kind: 'loading' });

  // Route: /workbench → projects dashboard; ?project=<id> or /workbench/<id> → editor;
  // ?showcase=<id> → a saved copy of the showcase (so edits persist and never touch the original).
  const loadLibrary = useLibraryStore((state) => state.load);
  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.__tessellate_workbench_store__ = useWorkbenchStore;
    let cancelled = false;
    const urlParams = new URLSearchParams(window.location.search);
    const pathId = /^\/workbench\/([^/?#]+)/.exec(window.location.pathname)?.[1];
    const projectId = urlParams.get('project') ?? (pathId ? decodeURIComponent(pathId) : null);
    const showcaseId = urlParams.get('showcase');

    const load = async () => {
      if (showcaseId) {
        const { SHOWCASE_PROJECTS } = await import('@tessellate/composer');
        const found = SHOWCASE_PROJECTS.find((s) => s.id === showcaseId);
        if (!found) return setView({ kind: 'not-found', projectId: showcaseId });
        const now = new Date().toISOString();
        const copy = { ...found.manifest, id: newProjectId(), createdAt: now, updatedAt: now };
        await saveLocalProject(copy);
        window.history.replaceState(null, '', `/workbench?project=${encodeURIComponent(copy.id)}`);
        if (!cancelled) {
          openProject(copy);
          setView({ kind: 'editor' });
        }
        return;
      }

      if (!projectId) return setView({ kind: 'dashboard' });

      const raw = await loadLocalProject(projectId);
      if (cancelled) return;
      if (!raw) return setView({ kind: 'not-found', projectId });

      const result = safelyLoadProjectRecord(raw);
      if (result.status === 'corrupted') return setView({ kind: 'corrupted', projectId, recovery: result });

      const checkpoints = await listLocalCheckpoints(projectId);
      if (cancelled) return;
      openProject({ ...result.manifest, id: projectId }, checkpoints);
      setView({ kind: 'editor' });
    };

    load().catch((err: unknown) => {
      if (!cancelled) setView({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    });
    return () => {
      cancelled = true;
    };
  }, [openProject]);

  // Local-first autosave while a stored project is open.
  useEffect(() => {
    if (view.kind !== 'editor') return;
    const stop = startProjectAutosave(useWorkbenchStore);
    return () => {
      void stop();
    };
  }, [view.kind]);

  // Responsive window listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger global shortcuts if typing in input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      // Escape to climb selection
      if (e.key === 'Escape') {
        e.preventDefault();
        selectParentNode();
      }

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      // 1: Desktop preset
      if (e.key === '1') {
        e.preventDefault();
        setDevicePreset('1440');
      }

      // 2: Tablet preset
      if (e.key === '2') {
        e.preventDefault();
        setDevicePreset('768');
      }

      // 3: Mobile preset
      if (e.key === '3') {
        e.preventDefault();
        setDevicePreset('390');
      }

      // F: Fit / 100% zoom
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setZoom(1.0);
      }

      // L: Lock selected node
      if (e.key.toLowerCase() === 'l' && selectedNodeId) {
        e.preventDefault();
        toggleNodeLock(selectedNodeId, 'structure');
      }

      // R: Replace selected node
      if (e.key.toLowerCase() === 'r' && selectedNodeId) {
        e.preventDefault();
        openReplaceDrawer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectParentNode, undo, redo, setDevicePreset, setZoom, toggleNodeLock, openReplaceDrawer]);

  if (view.kind === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--tess-dark-canvas,#0B0D10)] text-sm text-[var(--tess-dark-text-secondary,#A8AFBA)]" role="status">
        Opening…
      </div>
    );
  }
  if (view.kind === 'dashboard') return <ProjectsDashboard />;
  if (view.kind === 'not-found') return <ProjectNotFound projectId={view.projectId} />;
  if (view.kind === 'corrupted') return <ProjectRecovery projectId={view.projectId} recovery={view.recovery} />;
  if (view.kind === 'error') {
    return (
      <div role="alert" className="grid min-h-screen place-items-center bg-[var(--tess-dark-canvas,#0B0D10)] px-4 text-center text-sm text-[#FF8A93]">
        Could not open the project: {view.message}
      </div>
    );
  }

  // Clean full-screen preview mode
  if (isPreview) {
    return <PreviewModal />;
  }

  // Mobile layout below 1024px
  if (isMobileScreen) {
    return <MobileWorkbench />;
  }

  // Desktop viewport-filling shell
  return (
    <div
      data-testid="workbench-shell"
      className="h-screen w-screen overflow-hidden flex flex-col bg-[#FAF9F6] dark:bg-[#0B0D10] text-[#111217] dark:text-[#F5F7FA]"
    >
      {/* 56px Top Toolbar */}
      <TopToolbar />

      {/* Main 3-column composition canvas workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel (280px) */}
        <LeftPanel />

        {/* Central Canvas or Audit Dashboard */}
        {activeMode === 'audit' ? <AuditPanel /> : <WorkbenchCanvas />}

        {/* Right Contextual Inspector (340px) */}
        <RightInspector />

        {/* Advanced Modals & Drawers */}
        <ReplaceDrawer />
        <CompareModal />
        <BlendModal />
      </div>

      {/* 64px Command Bar */}
      <CommandBar />
    </div>
  );
}
