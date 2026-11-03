import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { BrowserManifestRenderer as ManifestRenderer } from '@tessellate/renderer/browser';
import { DeviceFrame } from './DeviceFrame.js';
import { CanvasToolbar } from './CanvasToolbar.js';
import { BreadcrumbBar } from './BreadcrumbBar.js';
import { useScreenResourcePreload } from '../use-screen-resource-preload.js';

export function WorkbenchCanvas() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const hoveredNodeId = useWorkbenchStore((state) => state.hoveredNodeId);
  const selectNode = useWorkbenchStore((state) => state.selectNode);
  const setHoveredNode = useWorkbenchStore((state) => state.setHoveredNode);
  const devicePreset = useWorkbenchStore((state) => state.devicePreset);
  const zoom = useWorkbenchStore((state) => state.zoom);
  const reducedMotion = useWorkbenchStore((state) => state.reducedMotion);
  const activeScreen = manifest.screens.find((screen) => screen.id === activeScreenId) ?? manifest.screens[0];
  const resourcesReady = useScreenResourcePreload(
    activeScreen?.rootNode,
    `${manifest.id}:${activeScreen?.id ?? activeScreenId}`,
  );

  const isMobileViewport = ['430', '390', '360'].includes(devicePreset);
  const isTabletViewport = devicePreset === '768';
  const viewportCategory = isMobileViewport ? 'mobile' : isTabletViewport ? 'tablet' : 'desktop';

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If clicked on canvas background directly, deselect
    if (e.target === e.currentTarget || (e.target instanceof HTMLElement && e.target.dataset.canvasBackground === 'true')) {
      selectNode(null);
    }
  };

  return (
    <div
      data-testid="workbench-canvas"
      onClick={handleCanvasClick}
      className="relative flex flex-1 min-w-0 h-full w-full flex-col overflow-hidden bg-[#07090C] select-none"
    >
      {/* Top Floating Breadcrumbs */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto">
        <BreadcrumbBar />
      </div>

      {/* Keep the preview scroll region separate from the fixed canvas controls. */}
      <div
        data-testid="workbench-canvas-scroll-area"
        data-canvas-background="true"
        className="min-h-0 min-w-0 flex-1 w-full overflow-auto px-8 pb-4 pt-14"
      >
        {/* Zoomable & Scalable Canvas Viewport Container */}
        <div
          data-canvas-background="true"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 150ms ease-out',
          }}
          className="w-full flex justify-center pb-4"
        >
          {resourcesReady ? (
            <DeviceFrame preset={devicePreset}>
              <div className="w-full min-h-full" data-canvas-background="true">
                <ManifestRenderer
                  manifest={manifest}
                  activeScreenId={activeScreenId}
                  context={{
                    selectedNodeId: selectedNodeId ?? undefined,
                    hoveredNodeId: hoveredNodeId ?? undefined,
                    onNodeSelect: selectNode,
                    onNodeHover: setHoveredNode,
                    viewport: viewportCategory,
                    reducedMotion,
                    deferOffscreenResources: true,
                  }}
                />
              </div>
            </DeviceFrame>
          ) : (
            <div
              data-testid="workbench-resource-preload-status"
              data-canvas-background="true"
              role="status"
              aria-live="polite"
              className="flex min-h-64 w-full items-center justify-center rounded-lg border border-[#252A32] bg-[#111419] px-6 py-12 text-sm text-[#A8AFBA]"
            >
              Loading resources for {activeScreen?.name ?? 'this screen'}…
            </div>
          )}
        </div>
      </div>

      {/* Reserve canvas space for camera controls so project content cannot sit underneath. */}
      <div className="pointer-events-auto flex w-full shrink-0 justify-center px-2 py-2">
        <CanvasToolbar />
      </div>
    </div>
  );
}
