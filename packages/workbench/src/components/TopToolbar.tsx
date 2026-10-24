import React, { useRef, useState } from 'react';
import { useWorkbenchStore } from '../store/workbench-store.js';
import type { WorkbenchMode } from '../types.js';
import {
  Undo2,
  Redo2,
  Eye,
  Download,
  Database,
  Sparkles,
  Bookmark,
  SplitSquareHorizontal,
  Shuffle,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import {
  ExportValidationError,
  generateAgentHandoffPackage,
  generateSourceTree,
  createZipArchive,
  importProjectManifestFromJson,
} from '@tessellate/exporter';
import { CheckpointsMenu } from './checkpoints/CheckpointsMenu.js';
import { listLocalProjects } from '../persistence/storage.js';

export function TopToolbar({ historySaveStatus = 'saved' }: { historySaveStatus?: 'loading' | 'saving' | 'saved' | 'unavailable' }) {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const updateProjectName = useWorkbenchStore((state) => state.updateProjectName);
  const activeMode = useWorkbenchStore((state) => state.activeMode);
  const setActiveMode = useWorkbenchStore((state) => state.setActiveMode);
  const isPreview = useWorkbenchStore((state) => state.isPreview);
  const togglePreview = useWorkbenchStore((state) => state.togglePreview);
  const history = useWorkbenchStore((state) => state.history);
  const future = useWorkbenchStore((state) => state.future);
  const undo = useWorkbenchStore((state) => state.undo);
  const redo = useWorkbenchStore((state) => state.redo);
  const checkpoints = useWorkbenchStore((state) => state.checkpoints);
  const openCompare = useWorkbenchStore((state) => state.openCompare);
  const openBlend = useWorkbenchStore((state) => state.openBlend);
  const surpriseMe = useWorkbenchStore((state) => state.surpriseMe);
  const recomposeScreenAroundLocks = useWorkbenchStore((state) => state.recomposeScreenAroundLocks);
  const setManifest = useWorkbenchStore((state) => state.setManifest);


  const [actionError,setActionError]=useState('');
  const runAction=(action:()=>void)=>{try{action();setActionError('');}catch(cause){setActionError(cause instanceof Error?cause.message:String(cause));}};
  const activeRoot=manifest.screens.find(screen=>screen.id===activeScreenId)?.rootNode;
  const recomposeLocked=Boolean(activeRoot?.locks?.node||activeRoot?.locks?.structure);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(manifest.name);
  const [isCheckpointsOpen, setIsCheckpointsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [manifestImportStatus, setManifestImportStatus] = useState('');
  const manifestInputRef = useRef<HTMLInputElement>(null);

  const modes: WorkbenchMode[] = ['structure', 'style', 'motion', 'content', 'audit'];

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleValue.trim()) {
      updateProjectName(titleValue.trim());
    } else {
      setTitleValue(manifest.name);
    }
  };

  const handleDownloadManifest = () => {
    const jsonStr = JSON.stringify(manifest, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${manifest.name.toLowerCase().replace(/\s+/g, '-')}.tess.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = () => {
    try {
      const sourceTree = generateSourceTree(manifest);
      const zipBytes = createZipArchive(sourceTree);
      const blob = new Blob([zipBytes as unknown as BlobPart], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileSlug = manifest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'tessellate-project';
      a.download = `${fileSlug}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      if (!(err instanceof ExportValidationError)) {
        console.error('Failed to generate standalone ZIP project:', err);
      }
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDownloadAgentHandoff = () => {
    try {
      const handoffFiles = generateAgentHandoffPackage(manifest).files;
      const zipBytes = createZipArchive(handoffFiles);
      const blob = new Blob([zipBytes as unknown as BlobPart], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const fileSlug = manifest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'tessellate-project';
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${fileSlug}-agent-handoff.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setActionError('');
    } catch (cause) {
      setActionError(`Agent handoff export failed: ${cause instanceof Error ? cause.message : String(cause)}`);
    }
  };

  const handleImportManifest = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setManifestImportStatus('');
    setActionError('');
    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Manifest files must be 5 MiB or smaller.');
      }
      const parsed = importProjectManifestFromJson(await file.text());
      if (!parsed.success || !parsed.manifest) {
        throw new Error(parsed.error ?? 'This file is not a valid Tessellate project manifest.');
      }

      const existingJournal = localStorage.getItem(`tessellate_project_${parsed.manifest.id}`);
      const existingProjects = await listLocalProjects();
      if (existingJournal || existingProjects.some((project) => project.id === parsed.manifest!.id)) {
        throw new Error(
          `A local project already uses ID ${parsed.manifest.id}. Import was cancelled to protect the saved project.`,
        );
      }

      setManifest(parsed.manifest);
      setManifestImportStatus(
        `${parsed.warnings?.join(' ') ?? ''}${parsed.warnings?.length ? ' ' : ''}Opened ${parsed.manifest.name}.`,
      );
      setIsExportOpen(false);
    } catch (cause) {
      setActionError(`Manifest import failed: ${cause instanceof Error ? cause.message : String(cause)}`);
    } finally {
      input.value = '';
      setIsImporting(false);
    }
  };

  return (
    <header
      data-testid="top-toolbar"
      className="dark min-h-14 shrink-0 px-3 py-2 gap-2 flex-wrap border-b border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#0B0D10] flex items-center justify-between select-none z-30 relative"
    >
      {actionError && <p role="alert" className="w-full text-sm">{actionError}</p>}
      {manifestImportStatus && <p role="status" data-testid="manifest-import-status" className="w-full text-xs">{manifestImportStatus}</p>}
      {/* Left Cluster: Brand, Title, Save Status */}
      <div className="flex basis-full min-w-0 flex-none items-center gap-3 md:basis-auto md:flex-1 lg:flex-none">
        <a
          href="/"
          className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
          title="Return to Tessellate Home"
        >
          <div className="h-7 w-7 rounded-lg bg-[#2547E8] dark:bg-[#6782FF] flex items-center justify-center text-white dark:text-[#0B0D10] font-black text-sm shadow-xs">
            T
          </div>
        </a>

        <div className="h-4 w-px bg-[#D9D6CF] dark:bg-[#272C34]" />

        {/* Project Title */}
        {isEditingTitle ? (
          <input
            type="text"
            aria-label="Project name" value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
            className="min-w-0 flex-1 max-w-[220px] text-sm truncate font-bold text-[#111217] dark:text-[#F5F7FA] border border-[#2547E8] rounded px-1.5 py-0.5 bg-white dark:bg-[#171B21] focus:outline-none"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setTitleValue(manifest.name);
              setIsEditingTitle(true);
            }}
            className="min-w-0 max-w-[220px] flex-1 truncate text-sm font-bold text-[#111217] dark:text-[#F5F7FA] hover:text-[#2547E8] transition-colors"
            title="Click to rename project"
          >
            {manifest.name}
          </button>
        )}

        <div
          data-testid="history-save-status"
          data-state={historySaveStatus}
          title={historySaveStatus === 'unavailable' ? 'Undo and redo history may not survive a reload on this device' : `Project and undo history ${historySaveStatus} on this device`}
          aria-label={historySaveStatus === 'unavailable' ? 'Undo and redo history unavailable after reload' : `Project and undo history ${historySaveStatus} on this device`}
          className="flex shrink-0 items-center gap-1 rounded-full bg-[#FAF9F6] dark:bg-[#171B21] border border-[#D9D6CF] dark:border-[#272C34] px-2 py-0.5 text-[10px] font-mono text-[#62666F] dark:text-[#A8AFBA]"
        >
          <Database className={`h-2.5 w-2.5 ${historySaveStatus === 'unavailable' ? 'text-amber-500' : 'text-emerald-700'}`} />
          <span>Local</span>
          <span className="text-[9px] uppercase tracking-wide">{historySaveStatus === 'loading' ? 'Loading' : historySaveStatus === 'saving' ? 'Saving' : historySaveStatus === 'unavailable' ? 'History limited' : 'Saved'}</span>
        </div>
      </div>

      {/* Center Modes Switcher */}
      <div className="flex flex-wrap items-center bg-[#FAF9F6] dark:bg-[#171B21] rounded-xl p-1 border border-[#D9D6CF]/70 dark:border-[#272C34]/70">
        <a
          href="/compose"
          className="px-3 py-1 rounded-lg text-xs font-medium text-[#62666F] dark:text-[#A8AFBA] hover:text-[#111217] dark:hover:text-[#F5F7FA] transition-colors flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3" />
          <span>Compose</span>
        </a>
        {modes.map((mode) => {
          const isActive = activeMode === mode;
          return (
            <button
              key={mode}
              aria-pressed={isActive} onClick={() => {setActiveMode(mode);if(window.innerWidth<1024)useWorkbenchStore.getState().setMobileTab(mode==='audit'?'audit':mode==='structure'?'pages':'selection');}}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                isActive
                  ? 'bg-white dark:bg-[#272C34] text-[#2547E8] dark:text-[#879DFF] shadow-xs'
                  : 'text-[#62666F] dark:text-[#A8AFBA] hover:text-[#111217] dark:hover:text-[#F5F7FA]'
              }`}
            >
              {mode}
            </button>
          );
        })}
      </div>

      {/* Right Cluster: Advanced Tools, Undo/Redo, Preview, Export */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Advanced Phase 10 Action Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            data-testid="recompose-button" disabled={recomposeLocked}
            onClick={() => runAction(()=>recomposeScreenAroundLocks(activeScreenId, { divergenceLevel: 95 }))}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D9D6CF] dark:border-[#272C34] text-xs font-medium text-[#111217] dark:text-[#F5F7FA] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21] transition-colors"
            title={recomposeLocked?'Unlock the root screen to recompose its structure.':'Recompose Screen (divergenceLevel 95)'}
          >
            <RefreshCw className="h-3 w-3 text-cyan-500" />
            <span>Recompose</span>
          </button>

          <button
            data-testid="surprise-me-button"
            onClick={() => runAction(()=>surpriseMe({ divergenceLevel: 60 }))}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D9D6CF] dark:border-[#272C34] text-xs font-medium text-[#111217] dark:text-[#F5F7FA] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21] transition-colors"
            title="Surprise Me (Controlled Divergence)"
          >
            <Shuffle className="h-3 w-3 text-amber-500" />
            <span>Surprise</span>
          </button>

          <button
            onClick={() => openBlend()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D9D6CF] dark:border-[#272C34] text-xs font-medium text-[#111217] dark:text-[#F5F7FA] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21] transition-colors"
            title="Blend Directions"
          >
            <Sparkles className="h-3 w-3 text-indigo-500" />
            <span>Blend</span>
          </button>

          <button
            onClick={() => openCompare()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D9D6CF] dark:border-[#272C34] text-xs font-medium text-[#111217] dark:text-[#F5F7FA] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21] transition-colors"
            title="Compare Versions"
          >
            <SplitSquareHorizontal className="h-3 w-3 text-blue-500" />
            <span>Compare</span>
          </button>

          {/* Checkpoints Button */}
          <div className="relative">
            <button
              onClick={() => setIsCheckpointsOpen(!isCheckpointsOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D9D6CF] dark:border-[#272C34] text-xs font-medium text-[#111217] dark:text-[#F5F7FA] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21] transition-colors"
              title="Checkpoints"
            >
              <Bookmark className="h-3 w-3 text-emerald-500" />
              <span>Snapshots ({checkpoints.length})</span>
            </button>
            {isCheckpointsOpen && (
              <CheckpointsMenu onClose={() => setIsCheckpointsOpen(false)} />
            )}
          </div>
        </div>

        <div className="h-4 w-px bg-[#D9D6CF] dark:bg-[#272C34]" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className={`p-1.5 rounded-lg border border-[#D9D6CF] dark:border-[#272C34] transition-all ${
              history.length > 0
                ? 'hover:bg-[#FAF9F6] dark:hover:bg-[#171B21] text-[#111217] dark:text-[#F5F7FA]'
                : 'opacity-30 cursor-not-allowed text-[var(--text-muted)]'
            }`}
            aria-label="Undo" title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className={`p-1.5 rounded-lg border border-[#D9D6CF] dark:border-[#272C34] transition-all ${
              future.length > 0
                ? 'hover:bg-[#FAF9F6] dark:hover:bg-[#171B21] text-[#111217] dark:text-[#F5F7FA]'
                : 'opacity-30 cursor-not-allowed text-[var(--text-muted)]'
            }`}
            aria-label="Redo" title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-[#D9D6CF] dark:bg-[#272C34]" />

        <button
          aria-label={isPreview ? "Exit Preview" : "Preview"} onClick={togglePreview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isPreview
              ? 'bg-[#2547E8] text-white shadow-xs'
              : 'border border-[#D9D6CF] dark:border-[#272C34] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21] text-[#111217] dark:text-[#F5F7FA]'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{isPreview ? 'Exit Preview' : 'Preview'}</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            aria-expanded={isExportOpen} data-testid="export-button"
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2547E8] dark:bg-[#6782FF] text-white dark:text-[#0B0D10] text-xs font-semibold hover:opacity-90 shadow-xs transition-opacity"
            title="Export project"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {isExportOpen && (
            <div
              data-testid="export-menu"
              className="fixed left-3 right-3 mt-2 w-auto sm:absolute sm:left-auto sm:right-0 sm:w-64 rounded-xl border border-[#D9D6CF] bg-white p-1.5 shadow-lg dark:border-[#272C34] dark:bg-[#171B21] z-50 text-xs"
            >
              <input
                ref={manifestInputRef}
                data-testid="manifest-import-input"
                type="file"
                accept=".tess.json,application/json"
                aria-label="Choose a Tessellate manifest"
                hidden
                onChange={handleImportManifest}
              />
              <button
                data-testid="import-manifest-btn"
                disabled={isImporting}
                onClick={() => manifestInputRef.current?.click()}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF9F6] dark:hover:bg-[#20252D] text-[#111217] dark:text-[#F5F7FA] font-medium transition-colors flex flex-col gap-0.5 disabled:opacity-60"
              >
                <span className="font-semibold">{isImporting ? 'Opening manifest…' : 'Open Tessellate Manifest'}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">Validated .tess.json · existing projects are protected</span>
              </button>
              <div className="my-1 border-t border-[#D9D6CF] dark:border-[#272C34]" />
              <button
                data-testid="export-manifest-btn"
                onClick={() => {
                  handleDownloadManifest();
                  setIsExportOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF9F6] dark:hover:bg-[#20252D] text-[#111217] dark:text-[#F5F7FA] font-medium transition-colors flex flex-col gap-0.5"
              >
                <span className="font-semibold">Download Tessellate Manifest</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">.tess.json</span>
              </button>
              <button
                data-testid="export-zip-btn"
                onClick={() => {
                  handleDownloadZip();
                  setIsExportOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF9F6] dark:hover:bg-[#20252D] text-[#111217] dark:text-[#F5F7FA] font-medium transition-colors flex flex-col gap-0.5"
              >
                <span className="font-semibold">Download Standalone React Project</span>
                <span className="text-[10px] text-[#2547E8] dark:text-[#879DFF] font-mono">Vite + React + Tailwind 4 (.zip)</span>
              </button>
              <button
                data-testid="export-agent-handoff-btn"
                onClick={() => {
                  handleDownloadAgentHandoff();
                  setIsExportOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF9F6] dark:hover:bg-[#20252D] text-[#111217] dark:text-[#F5F7FA] font-medium transition-colors flex flex-col gap-0.5"
              >
                <span className="font-semibold flex items-center gap-1.5">
                  <span>Download Agent Handoff Package</span>
                  <span className="rounded border border-amber-500/50 px-1 py-0.5 text-[9px] uppercase tracking-wide text-amber-700 dark:text-amber-300">Beta</span>
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">Review resources and dependency policy (.zip)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
