import React, { useState, useRef, useEffect } from 'react';
import type { ResourceManifest } from '@tessellate/schemas';
import type { PreviewDevice, PreviewTheme, PreviewUpdateMessage } from '@tessellate/catalog/protocol';
import { Monitor, Tablet, Smartphone, Sun, Moon, RotateCcw, Activity } from 'lucide-react';

export interface ResourcePreviewFrameProps {
  manifest: ResourceManifest;
  initialVariant?: string;
  initialDevice?: PreviewDevice;
  initialTheme?: PreviewTheme;
  previewUrl?: string;
}

export function ResourcePreviewFrame({
  manifest,
  initialVariant,
  initialDevice = 'desktop',
  initialTheme = 'light',
  previewUrl = '/preview',
}: ResourcePreviewFrameProps) {
  const defaultVariant = initialVariant ?? manifest.variants[0]?.id ?? 'expressive';
  const [variant, setVariant] = useState<string>(defaultVariant);
  const [device, setDevice] = useState<PreviewDevice>(initialDevice);
  const [theme, setTheme] = useState<PreviewTheme>(initialTheme);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send updates to iframe whenever controls change
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;

    const updateMsg: PreviewUpdateMessage = {
      type: 'TESSELLATE_PREVIEW_UPDATE',
      variant,
      theme,
      device,
      reducedMotion,
    };

    try {
      iframeRef.current.contentWindow.postMessage(updateMsg, '*');
    } catch {
      // Ignore
    }
  }, [variant, theme, device, reducedMotion, iframeLoaded]);

  const handleReset = () => {
    setVariant(defaultVariant);
    setDevice('desktop');
    setTheme('light');
    setReducedMotion(false);
    if (iframeRef.current) {
      iframeRef.current.src = `${previewUrl}?resource=${manifest.slug}&variant=${defaultVariant}&theme=light&device=desktop`;
    }
  };

  const deviceWidthClass = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[360px]',
  }[device];

  const constructedSrc = `${previewUrl}?resource=${manifest.slug}&variant=${variant}&theme=${theme}&device=${device}&reducedMotion=${reducedMotion}`;

  return (
    <div className="flex flex-col rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-surface,#FAF9F6)] overflow-hidden shadow-xs">
      {/* Top Toolbar */}
      <div className="h-12 px-4 border-b border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-canvas,#F4F2ED)] flex items-center justify-between gap-4">
        {/* Variant selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--tess-ink-muted,#8B8F97)] mr-1">
            Variant:
          </span>
          {manifest.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariant(v.id)}
              className={`h-7 px-2.5 rounded-md text-xs font-medium transition-all ${
                variant === v.id
                  ? 'bg-[var(--tess-cobalt,#2547E8)] text-white shadow-xs'
                  : 'bg-white text-[var(--tess-ink-secondary,#62666F)] hover:bg-[var(--tess-canvas-strong,#ECE9E2)] border border-[var(--tess-hairline,#D9D6CF)]'
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>

        {/* Viewport and mode toggles */}
        <div className="flex items-center gap-2">
          {/* Device Segmented Control */}
          <div className="inline-flex rounded-lg border border-[var(--tess-hairline,#D9D6CF)] bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              title="Desktop (1440px)"
              onClick={() => setDevice('desktop')}
              className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${
                device === 'desktop'
                  ? 'bg-[var(--tess-canvas-strong,#ECE9E2)] text-[var(--tess-cobalt,#2547E8)]'
                  : 'text-[var(--tess-ink-muted,#8B8F97)] hover:text-[var(--tess-ink,#111217)]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Tablet (768px)"
              onClick={() => setDevice('tablet')}
              className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${
                device === 'tablet'
                  ? 'bg-[var(--tess-canvas-strong,#ECE9E2)] text-[var(--tess-cobalt,#2547E8)]'
                  : 'text-[var(--tess-ink-muted,#8B8F97)] hover:text-[var(--tess-ink,#111217)]'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Mobile (360px)"
              onClick={() => setDevice('mobile')}
              className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${
                device === 'mobile'
                  ? 'bg-[var(--tess-canvas-strong,#ECE9E2)] text-[var(--tess-cobalt,#2547E8)]'
                  : 'text-[var(--tess-ink-muted,#8B8F97)] hover:text-[var(--tess-ink,#111217)]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="h-7 w-7 rounded-lg border border-[var(--tess-hairline,#D9D6CF)] bg-white flex items-center justify-center text-[var(--tess-ink-secondary,#62666F)] hover:bg-[var(--tess-canvas-strong,#ECE9E2)] transition-colors shadow-2xs"
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          {/* Reduced Motion Toggle */}
          <button
            type="button"
            title={`Reduced Motion: ${reducedMotion ? 'ON' : 'OFF'}`}
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`h-7 px-2 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors shadow-2xs ${
              reducedMotion
                ? 'border-[var(--tess-cobalt,#2547E8)] bg-[#E7EBFF] text-[var(--tess-cobalt,#2547E8)] font-semibold'
                : 'border-[var(--tess-hairline,#D9D6CF)] bg-white text-[var(--tess-ink-muted,#8B8F97)] hover:text-[var(--tess-ink,#111217)]'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Motion</span>
          </button>

          {/* Reset button */}
          <button
            type="button"
            title="Reset preview state"
            onClick={handleReset}
            className="h-7 w-7 rounded-lg border border-[var(--tess-hairline,#D9D6CF)] bg-white flex items-center justify-center text-[var(--tess-ink-muted,#8B8F97)] hover:text-[var(--tess-ink,#111217)] transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="min-h-[460px] max-h-[720px] bg-[var(--tess-canvas-strong,#ECE9E2)] p-4 flex items-center justify-center overflow-auto">
        <div
          className={`transition-all duration-300 rounded-lg overflow-hidden border border-[var(--tess-hairline,#D9D6CF)] shadow-sm bg-white dark:bg-[#0B0D10] ${deviceWidthClass}`}
        >
          <iframe
            ref={iframeRef}
            src={constructedSrc}
            title={`${manifest.name} live preview`}
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => setIframeLoaded(true)}
            className="w-full min-h-[500px] border-0 bg-transparent block"
          />
        </div>
      </div>
    </div>
  );
}
