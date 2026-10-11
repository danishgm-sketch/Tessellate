import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { ManifestRenderer } from '@tessellate/renderer';
import { DeviceFrame } from './DeviceFrame.js';
import { CanvasToolbar } from './CanvasToolbar.js';
import { BreadcrumbBar } from './BreadcrumbBar.js';

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

  const isMobileViewport = ['430', '390', '360'].includes(devicePreset);
  const isTabletViewport = devicePreset === '768';
  const viewportCategory = isMobileViewport ? 'mobile' : isTabletViewport ? 'tablet' : 'desktop';

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If clicked on canvas background directly, deselect
    if (e.target === e.currentTarget) {
      selectNode(null);
    }
  };

  return (
    <div
      data-testid="workbench-canvas"
      onClick={handleCanvasClick}
      className="relative flex-1 h-full w-full overflow-auto bg-[#F4F2ED] dark:bg-[#07090C] p-8 flex flex-col items-center justify-start select-none"
    >
      {/* Top Floating Breadcrumbs */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto">
        <BreadcrumbBar />
      </div>

      {/* Floating Canvas Camera Controls */}
      <div className="absolute bottom-4 z-20 pointer-events-auto">
        <CanvasToolbar />
      </div>

      {/* Zoomable & Scalable Canvas Viewport Container */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 150ms ease-out',
        }}
        className="w-full flex justify-center pb-24 pt-6"
      >
        <DeviceFrame preset={devicePreset}>
          <div className="w-full min-h-full">
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
              }}
            />
          </div>
        </DeviceFrame>
      </div>
    </div>
  );
}
