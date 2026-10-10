import React, { useState } from 'react';
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
} from 'lucide-react';
import { CheckpointsMenu } from './checkpoints/CheckpointsMenu.js';

export function TopToolbar() {
  const manifest = useWorkbenchStore((state) => state.manifest);
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

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(manifest.name);
  const [isCheckpointsOpen, setIsCheckpointsOpen] = useState(false);

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
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header
      data-testid="top-toolbar"
      className="h-14 shrink-0 px-4 border-b border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#0B0D10] flex items-center justify-between select-none z-30 relative"
    >
      {/* Left Cluster: Brand, Title, Save Status */}
      <div className="flex items-center gap-3">
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
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
            className="text-sm font-bold text-[#111217] dark:text-[#F5F7FA] border border-[#2547E8] rounded px-1.5 py-0.5 bg-white dark:bg-[#171B21] focus:outline-none"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setTitleValue(manifest.name);
              setIsEditingTitle(true);
            }}
            className="text-sm font-bold text-[#111217] dark:text-[#F5F7FA] hover:text-[#2547E8] transition-colors"
            title="Click to rename project"
          >
            {manifest.name}
          </button>
        )}

        <div className="flex items-center gap-1 rounded-full bg-[#FAF9F6] dark:bg-[#171B21] border border-[#D9D6CF] dark:border-[#272C34] px-2 py-0.5 text-[10px] font-mono text-[#62666F] dark:text-[#A8AFBA]">
          <Database className="h-2.5 w-2.5 text-emerald-600" />
          <span>Local</span>
        </div>
      </div>

      {/* Center Modes Switcher */}
      <div className="hidden md:flex items-center bg-[#FAF9F6] dark:bg-[#171B21] rounded-xl p-1 border border-[#D9D6CF]/70 dark:border-[#272C34]/70">
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
              onClick={() => setActiveMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                isActive
                  ? 'bg-white dark:bg-[#272C34] text-[#2547E8] dark:text-[#6782FF] shadow-xs'
                  : 'text-[#62666F] dark:text-[#A8AFBA] hover:text-[#111217] dark:hover:text-[#F5F7FA]'
              }`}
            >
              {mode}
            </button>
          );
        })}
      </div>

      {/* Right Cluster: Advanced Tools, Undo/Redo, Preview, Export */}
      <div className="flex items-center gap-2">
        {/* Advanced Phase 10 Action Buttons */}
        <div className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => surpriseMe()}
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
                : 'opacity-30 cursor-not-allowed text-[#8B8F97]'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className={`p-1.5 rounded-lg border border-[#D9D6CF] dark:border-[#272C34] transition-all ${
              future.length > 0
                ? 'hover:bg-[#FAF9F6] dark:hover:bg-[#171B21] text-[#111217] dark:text-[#F5F7FA]'
                : 'opacity-30 cursor-not-allowed text-[#8B8F97]'
            }`}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-[#D9D6CF] dark:bg-[#272C34]" />

        <button
          onClick={togglePreview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isPreview
              ? 'bg-[#2547E8] text-white shadow-xs'
              : 'border border-[#D9D6CF] dark:border-[#272C34] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21] text-[#111217] dark:text-[#F5F7FA]'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{isPreview ? 'Exit Preview' : 'Preview'}</span>
        </button>

        <button
          onClick={handleDownloadManifest}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2547E8] dark:bg-[#6782FF] text-white dark:text-[#0B0D10] text-xs font-semibold hover:opacity-90 shadow-xs transition-opacity"
          title="Export .tess.json manifest"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
