import React, { useState, useRef, useEffect } from 'react';
import type { ResourceManifest } from '@tessellate/schemas';
import { isPreviewToParentMessage, resolvePreviewNavigationDestination } from '@tessellate/catalog/protocol';
import type {
  PreviewDevice,
  PreviewNavigationDestination,
  PreviewTheme,
  PreviewUpdateMessage,
} from '@tessellate/catalog/protocol';
import { Monitor, Tablet, Smartphone, Sun, Moon, RotateCcw, Activity } from 'lucide-react';
import { PreviewNavigationConfirmation } from './PreviewNavigationConfirmation';

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
  previewUrl = '/preview-content/',
}: ResourcePreviewFrameProps) {
  const defaultVariant = initialVariant ?? manifest.variants[0]?.id ?? 'expressive';
  const [variant, setVariant] = useState<string>(defaultVariant);
  const [device, setDevice] = useState<PreviewDevice>(initialDevice);
  const [theme, setTheme] = useState<PreviewTheme>(initialTheme);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [previewDestination, setPreviewDestination] = useState<PreviewNavigationDestination | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.source !== iframeRef.current?.contentWindow ||
        event.origin !== 'null' ||
        !isPreviewToParentMessage(event.data) ||
        event.data.resourceId !== manifest.slug
      ) {
        return;
      }
      if (event.data.type === 'TESSELLATE_PREVIEW_NAVIGATION_REQUEST') {
        setPreviewDestination(
          resolvePreviewNavigationDestination(event.data.href, window.location.origin),
        );
        return;
      }
      if (event.data.type !== 'TESSELLATE_PREVIEW_READY' || initializedRef.current) return;

      initializedRef.current = true;
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: 'TESSELLATE_PREVIEW_INIT',
          resourceId: manifest.slug,
          props: manifest.preview.defaultProps,
          variant,
          theme,
          device,
          reducedMotion,
        },
        '*'
      );
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [manifest, variant, theme, device, reducedMotion]);

  // Send updates to iframe whenever controls change
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;

    const updateMsg: PreviewUpdateMessage = {
      type: 'TESSELLATE_PREVIEW_UPDATE',
      props: manifest.preview.defaultProps,
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
    setPreviewDestination(null);
  };

  const deviceWidthClass = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[360px]',
  }[device];

  const initialIframeSrc = `${previewUrl}?resource=${encodeURIComponent(manifest.slug)}&variant=${encodeURIComponent(defaultVariant)}&theme=${initialTheme}&device=${initialDevice}&reducedMotion=false`;

  return (
    <div className="flex flex-col rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-surface,#FAF9F6)] overflow-hidden shadow-xs">
      {/* Top Toolbar */}
      <div className="min-h-12 py-2 flex-wrap px-3 border-b border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-canvas,#F4F2ED)] flex items-center justify-between gap-4">
        {/* Variant selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--tess-ink-muted,#62666F)] mr-1">
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
                  : 'text-[var(--tess-ink-muted,#62666F)] hover:text-[var(--tess-ink,#111217)]'
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
                  : 'text-[var(--tess-ink-muted,#62666F)] hover:text-[var(--tess-ink,#111217)]'
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
                  : 'text-[var(--tess-ink-muted,#62666F)] hover:text-[var(--tess-ink,#111217)]'
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
                : 'border-[var(--tess-hairline,#D9D6CF)] bg-white text-[var(--tess-ink-muted,#62666F)] hover:text-[var(--tess-ink,#111217)]'
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
            className="h-7 w-7 rounded-lg border border-[var(--tess-hairline,#D9D6CF)] bg-white flex items-center justify-center text-[var(--tess-ink-muted,#62666F)] hover:text-[var(--tess-ink,#111217)] transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {previewDestination && (
        <PreviewNavigationConfirmation
          destination={previewDestination}
          onDismiss={() => setPreviewDestination(null)}
        />
      )}

      {/* Frame Container */}
      <div className="min-h-[460px] max-h-[720px] bg-[var(--tess-canvas-strong,#ECE9E2)] p-4 flex items-center justify-center overflow-auto">
        <div
          className={`transition-all duration-300 rounded-lg overflow-hidden border border-[var(--tess-hairline,#D9D6CF)] shadow-sm bg-white dark:bg-[#0B0D10] ${deviceWidthClass}`}
        >
          <iframe
            ref={iframeRef}
            src={initialIframeSrc}
            title={`${manifest.name} live preview`}
            sandbox="allow-scripts"
            onLoad={() => {
              initializedRef.current = false;
              setIframeLoaded(true);
            }}
            className="w-full min-h-[500px] border-0 bg-transparent block"
          />
        </div>
      </div>
    </div>
  );
}
