import React from 'react';
import {useDialogFocus} from '@tessellate/ui';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { ManifestRenderer } from '@tessellate/renderer';
import { DeviceFrame } from '../canvas/DeviceFrame.js';
import { X, Wind, Monitor, Tablet, Smartphone } from 'lucide-react';

export function PreviewModal() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const setActiveScreen = useWorkbenchStore((state) => state.setActiveScreen);
  const togglePreview = useWorkbenchStore((state) => state.togglePreview);
  const devicePreset = useWorkbenchStore((state) => state.devicePreset);
  const setDevicePreset = useWorkbenchStore((state) => state.setDevicePreset);
  const reducedMotion = useWorkbenchStore((state) => state.reducedMotion);
  const toggleReducedMotion = useWorkbenchStore((state) => state.toggleReducedMotion);

  const dialogRef=useDialogFocus<HTMLDivElement>(true,togglePreview);
  const isMobileViewport = ['430', '390', '360'].includes(devicePreset);
  const isTabletViewport = devicePreset === '768';
  const viewportCategory = isMobileViewport ? 'mobile' : isTabletViewport ? 'tablet' : 'desktop';

  return (
    <div
      data-testid="preview-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-label="Project preview" tabIndex={-1}
      className="fixed inset-0 z-50 bg-[#FAF9F6] dark:bg-[#07090C] flex flex-col overflow-hidden"
    >
      {/* Floating Preview Controls Banner */}
      <div className="dark shrink-0 flex-wrap max-w-full z-50 flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/90 dark:bg-[#171B21]/90 backdrop-blur-md border border-[#D9D6CF] dark:border-[#272C34] shadow-lg text-xs font-mono select-none">
        {/* Screen Switcher */}
        <div className="flex items-center gap-1.5 border-r border-[#D9D6CF] dark:border-[#272C34] pr-3">
          <span className="text-[var(--text-muted)]">Screen:</span>
          <select
            aria-label="Preview screen" value={activeScreenId}
            onChange={(e) => setActiveScreen(e.target.value)}
            className="rounded bg-[#FAF9F6] dark:bg-[#0B0D10] border border-[#D9D6CF] dark:border-[#272C34] px-2 py-1 text-xs font-bold font-sans text-[#111217] dark:text-[#F5F7FA] focus:outline-none"
          >
            {manifest.screens.map((screen) => (
              <option key={screen.id} value={screen.id}>
                {screen.name} ({screen.slug})
              </option>
            ))}
          </select>
        </div>

        {/* Device Quick Switcher */}
        <div className="flex items-center gap-1 border-r border-[#D9D6CF] dark:border-[#272C34] pr-3">
          <button
            onClick={() => setDevicePreset('1440')}
            className={`p-1.5 rounded-lg transition-colors ${
              devicePreset === '1440' || devicePreset === 'responsive'
                ? 'bg-[#2547E8] text-white'
                : 'text-[#62666F] dark:text-[#A8AFBA]'
            }`}
            aria-label="Desktop" title="Desktop"
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDevicePreset('768')}
            className={`p-1.5 rounded-lg transition-colors ${
              devicePreset === '768'
                ? 'bg-[#2547E8] text-white'
                : 'text-[#62666F] dark:text-[#A8AFBA]'
            }`}
            aria-label="Tablet" title="Tablet"
          >
            <Tablet className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDevicePreset('390')}
            className={`p-1.5 rounded-lg transition-colors ${
              devicePreset === '390'
                ? 'bg-[#2547E8] text-white'
                : 'text-[#62666F] dark:text-[#A8AFBA]'
            }`}
            aria-label="Mobile" title="Mobile"
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Reduced Motion Toggle */}
        <button
          onClick={toggleReducedMotion}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-colors ${
            reducedMotion
              ? 'bg-amber-100 text-amber-900 font-bold'
              : 'text-[#62666F] dark:text-[#A8AFBA] hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Wind className="h-3 w-3" />
          <span>Reduced Motion</span>
        </button>

        {/* Exit Preview Button */}
        <button
          onClick={togglePreview}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#111217] dark:bg-[#F5F7FA] text-white dark:text-[#111217] font-semibold text-xs hover:opacity-90 transition-opacity"
        >
          <X className="h-3 w-3" />
          <span>Exit Preview</span>
        </button>
      </div>

      {/* Render Canvas in Device Frame */}
      <div className="flex-1 overflow-auto p-2 flex items-start">
        <DeviceFrame preset={devicePreset}>
          <ManifestRenderer
            manifest={manifest}
            activeScreenId={activeScreenId}
            context={{
              viewport: viewportCategory,
              reducedMotion,
            }}
          />
        </DeviceFrame>
      </div>
    </div>
  );
}
