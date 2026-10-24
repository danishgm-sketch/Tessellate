import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {
  isParentToPreviewMessage,
  type PreviewTheme,
  type PreviewDevice,
  type PreviewReadyMessage,
  type PreviewResizeMessage,
  type PreviewErrorMessage,
} from '@tessellate/catalog/protocol';
import { ButtonPreview } from '../../../resources/primitives/button/preview.js';
import { GENERATED_PREVIEW_COMPONENTS } from './generated-previews.js';
import './style.css';

// Universal preview component registry across all 324 catalog resources
const PREVIEW_COMPONENTS: Record<string, React.ComponentType<Record<string, unknown>>> = {
  ...GENERATED_PREVIEW_COMPONENTS,
  button: ButtonPreview as unknown as React.ComponentType<Record<string, unknown>>,
  ButtonPreview: ButtonPreview as unknown as React.ComponentType<Record<string, unknown>>,
};

export function PreviewApp() {
  const [resourceId, setResourceId] = useState<string>(() =>
    typeof window === 'undefined' ? 'button' : new URLSearchParams(window.location.search).get('resource') ?? 'button'
  );
  const [variant, setVariant] = useState<string>(() =>
    typeof window === 'undefined' ? 'expressive' : new URLSearchParams(window.location.search).get('variant') ?? 'expressive'
  );
  const [theme, setTheme] = useState<PreviewTheme>(() => {
    const value = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('theme');
    return value === 'dark' ? 'dark' : 'light';
  });
  const [device, setDevice] = useState<PreviewDevice>(() => {
    const value = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('device');
    return value === 'tablet' || value === 'mobile' ? value : 'desktop';
  });
  const [props, setProps] = useState<Record<string, unknown>>({});
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const Component = PREVIEW_COMPONENTS[resourceId];

  // Initialize from URL search parameters if provided
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rm = params.get('reducedMotion');
    if (rm === 'true') setReducedMotion(true);
  }, []);

  // Update theme class on root element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.dataset.tessellateReducedMotion = 'true';
    } else {
      delete document.documentElement.dataset.tessellateReducedMotion;
    }
  }, [reducedMotion]);

  // Handle postMessage protocol from parent shell
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!isParentToPreviewMessage(event.data)) {
        return;
      }

      const msg = event.data;
      if (msg.type === 'TESSELLATE_PREVIEW_INIT') {
        if (msg.resourceId) setResourceId(msg.resourceId);
        if (msg.variant) setVariant(msg.variant);
        if (msg.theme) setTheme(msg.theme);
        if (msg.device) setDevice(msg.device);
        if (msg.props) setProps(msg.props);
        if (typeof msg.reducedMotion === 'boolean') setReducedMotion(msg.reducedMotion);
      } else if (msg.type === 'TESSELLATE_PREVIEW_UPDATE') {
        if (msg.variant) setVariant(msg.variant);
        if (msg.theme) setTheme(msg.theme);
        if (msg.device) setDevice(msg.device);
        if (msg.props) setProps((prev) => ({ ...prev, ...msg.props }));
        if (typeof msg.reducedMotion === 'boolean') setReducedMotion(msg.reducedMotion);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Post READY message and observe container resize
  useEffect(() => {
    if (!Component) return;
    const el = containerRef.current;
    if (!el) return;

    const readyMsg: PreviewReadyMessage = {
      type: 'TESSELLATE_PREVIEW_READY',
      resourceId,
      width: el.scrollWidth,
      height: el.scrollHeight,
    };
    try {
      window.parent.postMessage(readyMsg, '*');
    } catch {
      // Ignored if not in iframe
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const resizeMsg: PreviewResizeMessage = {
          type: 'TESSELLATE_PREVIEW_RESIZE',
          resourceId,
          width: Math.round(entry.contentRect.width),
          height: Math.round(entry.contentRect.height),
        };
        try {
          window.parent.postMessage(resizeMsg, '*');
        } catch {
          // Ignored
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [Component, resourceId, variant, theme]);

  // Report missing resources after commit; never render a different resource as a substitute.
  useEffect(() => {
    if (Component) return;

    const errorMsg: PreviewErrorMessage = {
      type: 'TESSELLATE_PREVIEW_ERROR',
      resourceId,
      error: `Resource preview not found for '${resourceId}'`,
    };
    window.parent.postMessage(errorMsg, '*');
  }, [Component, resourceId]);

  if (!Component) {
    return (
      <div role="alert" className="flex min-h-screen items-center justify-center p-6 text-sm text-neutral-500">
        Preview component for &quot;{resourceId}&quot; is not available.
      </div>
    );
  }

  // Device container styling
  const deviceStyles: Record<PreviewDevice, string> = {
    desktop: 'w-full',
    tablet: 'max-w-[768px] mx-auto shadow-md border-x border-neutral-200 dark:border-neutral-800',
    mobile: 'max-w-[360px] mx-auto shadow-md border-x border-neutral-200 dark:border-neutral-800',
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen w-full transition-colors ${
        reducedMotion ? 'motion-reduce:transition-none' : ''
      }`}
    >
      <div className={deviceStyles[device]}>
        <Component
          initialVariant={variant}
          {...props}
        />
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PreviewApp />
    </React.StrictMode>
  );
}
