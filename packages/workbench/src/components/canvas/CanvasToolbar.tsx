import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import type { DevicePreset } from '../../types.js';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Wind,
} from 'lucide-react';

export function CanvasToolbar() {
  const zoom = useWorkbenchStore((state) => state.zoom);
  const setZoom = useWorkbenchStore((state) => state.setZoom);
  const devicePreset = useWorkbenchStore((state) => state.devicePreset);
  const setDevicePreset = useWorkbenchStore((state) => state.setDevicePreset);
  const togglePreview = useWorkbenchStore((state) => state.togglePreview);
  const isPreview = useWorkbenchStore((state) => state.isPreview);
  const reducedMotion = useWorkbenchStore((state) => state.reducedMotion);
  const toggleReducedMotion = useWorkbenchStore((state) => state.toggleReducedMotion);

  const presets: Array<{ id: DevicePreset; label: string; icon: React.ReactNode }> = [
    { id: 'responsive', label: 'Fluid', icon: <Maximize2 className="h-3 w-3" /> },
    { id: '1440', label: '1440', icon: <Monitor className="h-3 w-3" /> },
    { id: '1024', label: '1024', icon: <Monitor className="h-3 w-3" /> },
    { id: '768', label: '768', icon: <Tablet className="h-3 w-3" /> },
    { id: '390', label: '390', icon: <Smartphone className="h-3 w-3" /> },
  ];

  return (
    <div
      data-testid="canvas-toolbar"
      className="flex items-center gap-2 p-1.5 bg-white/90 dark:bg-[#111217]/90 backdrop-blur-md rounded-xl border border-[#D9D6CF] dark:border-[#272C34] shadow-md text-xs font-mono select-none"
    >
      {/* Device Preset Switcher */}
      <div className="flex items-center bg-[#FAF9F6] dark:bg-[#171B21] rounded-lg p-0.5 border border-[#D9D6CF]/50 dark:border-[#272C34]/50">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => setDevicePreset(p.id)}
            title={p.label}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
              devicePreset === p.id
                ? 'bg-white dark:bg-[#272C34] text-[#2547E8] dark:text-[#6782FF] shadow-xs'
                : 'text-[#62666F] dark:text-[#A8AFBA] hover:text-[#111217] dark:hover:text-[#F5F7FA]'
            }`}
          >
            {p.icon}
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-[#D9D6CF] dark:bg-[#272C34]" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="p-1 rounded hover:bg-[#FAF9F6] dark:hover:bg-[#171B21] text-[#62666F] dark:text-[#A8AFBA]"
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="w-12 text-center text-[11px] font-bold text-[#111217] dark:text-[#F5F7FA]">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="p-1 rounded hover:bg-[#FAF9F6] dark:hover:bg-[#171B21] text-[#62666F] dark:text-[#A8AFBA]"
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setZoom(1.0)}
          className="px-1.5 py-0.5 rounded text-[10px] text-[#62666F] dark:text-[#A8AFBA] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21]"
          title="Reset to 100%"
        >
          100%
        </button>
      </div>

      <div className="h-4 w-px bg-[#D9D6CF] dark:bg-[#272C34]" />

      {/* Reduced Motion Toggle */}
      <button
        onClick={toggleReducedMotion}
        title={reducedMotion ? 'Reduced Motion: ON' : 'Reduced Motion: OFF'}
        className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
          reducedMotion
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold'
            : 'text-[#62666F] dark:text-[#A8AFBA] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21]'
        }`}
      >
        <Wind className="h-3 w-3" />
        <span>{reducedMotion ? 'Reduced' : 'Motion'}</span>
      </button>

      {/* Preview Toggle */}
      <button
        onClick={togglePreview}
        title="Toggle Clean Preview Mode"
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
          isPreview
            ? 'bg-[#2547E8] text-white shadow-xs'
            : 'bg-[#FAF9F6] dark:bg-[#171B21] text-[#111217] dark:text-[#F5F7FA] hover:bg-[#EAE8E3] dark:hover:bg-[#272C34]'
        }`}
      >
        <Eye className="h-3.5 w-3.5" />
        <span>{isPreview ? 'Exit Preview' : 'Preview'}</span>
      </button>
    </div>
  );
}
