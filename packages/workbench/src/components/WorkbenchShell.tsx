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
import { AuditPanel } from './audit/AuditPanel.js';

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
