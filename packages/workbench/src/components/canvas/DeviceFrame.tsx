import React from 'react';
import type { DevicePreset } from '../../types.js';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

interface DeviceFrameProps {
  preset: DevicePreset;
  children: React.ReactNode;
}

export const DEVICE_WIDTHS: Record<DevicePreset, string | number> = {
  responsive: '100%',
  '1440': 1440,
  '1280': 1280,
  '1024': 1024,
  '768': 768,
  '430': 430,
  '390': 390,
  '360': 360,
};

export function DeviceFrame({ preset, children }: DeviceFrameProps) {
  const isResponsive = preset === 'responsive';
  const widthVal = DEVICE_WIDTHS[preset];

  const getDeviceIcon = () => {
    if (preset === '768') return <Tablet className="h-3.5 w-3.5" />;
    if (['430', '390', '360'].includes(preset)) return <Smartphone className="h-3.5 w-3.5" />;
    return <Monitor className="h-3.5 w-3.5" />;
  };

  const getDeviceLabel = () => {
    switch (preset) {
      case '1440':
        return 'Desktop Wide (1440px)';
      case '1280':
        return 'Desktop Standard (1280px)';
      case '1024':
        return 'Small Desktop / Tablet Landscape (1024px)';
      case '768':
        return 'Tablet Portrait (768px)';
      case '430':
        return 'Mobile Max (430px)';
      case '390':
        return 'Mobile Standard (390px)';
      case '360':
        return 'Mobile Compact (360px)';
      default:
        return 'Fluid Responsive (100%)';
    }
  };

  if (isResponsive) {
    return (
      <div className="w-full h-full min-h-full flex flex-col shadow-sm rounded-lg overflow-auto border border-[#D9D6CF]/60 dark:border-[#272C34]/60 bg-white dark:bg-[#111217]">
        {children}
      </div>
    );
  }

  return (
    <div
      style={{ width: typeof widthVal === 'number' ? `${widthVal}px` : widthVal }}
      className="mx-auto flex flex-col shrink-0 rounded-2xl border-2 border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#111217] shadow-xl overflow-hidden transition-all duration-300"
    >
      {/* Device Chrome Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#D9D6CF] dark:border-[#272C34] bg-[#FAF9F6] dark:bg-[#171B21] text-xs font-mono text-[#62666F] dark:text-[#A8AFBA] select-none">
        <div className="flex items-center gap-2">
          {getDeviceIcon()}
          <span>{getDeviceLabel()}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="h-2 w-2 rounded-full bg-green-400" />
        </div>
      </div>

      {/* Frame Viewport Content */}
      <div className="w-full flex-1 overflow-auto">{children}</div>
    </div>
  );
}
