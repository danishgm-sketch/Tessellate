/**
 * Typed postMessage communication protocol between parent platform shell
 * and isolated sandboxed preview iframe.
 */

export type PreviewTheme = 'light' | 'dark';
export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export interface PreviewInitMessage {
  type: 'TESSELLATE_PREVIEW_INIT';
  resourceId: string;
  variant?: string;
  theme?: PreviewTheme;
  device?: PreviewDevice;
  props?: Record<string, unknown>;
  reducedMotion?: boolean;
}

export interface PreviewUpdateMessage {
  type: 'TESSELLATE_PREVIEW_UPDATE';
  variant?: string;
  theme?: PreviewTheme;
  device?: PreviewDevice;
  props?: Record<string, unknown>;
  reducedMotion?: boolean;
}

export interface PreviewReadyMessage {
  type: 'TESSELLATE_PREVIEW_READY';
  resourceId: string;
  width: number;
  height: number;
}

export interface PreviewResizeMessage {
  type: 'TESSELLATE_PREVIEW_RESIZE';
  resourceId: string;
  width: number;
  height: number;
}

export interface PreviewErrorMessage {
  type: 'TESSELLATE_PREVIEW_ERROR';
  resourceId?: string;
  error: string;
}

export interface PreviewNavigationRequestMessage {
  type: 'TESSELLATE_PREVIEW_NAVIGATION_REQUEST';
  resourceId: string;
  href: string;
}

export type ParentToPreviewMessage = PreviewInitMessage | PreviewUpdateMessage;
export type PreviewToParentMessage =
  | PreviewReadyMessage
  | PreviewResizeMessage
  | PreviewErrorMessage
  | PreviewNavigationRequestMessage;
export type TessellatePreviewMessage = ParentToPreviewMessage | PreviewToParentMessage;

export interface PreviewNavigationDestination {
  href: string;
  label: string;
  external: boolean;
}

export const PREVIEW_MESSAGE_TYPES = [
  'TESSELLATE_PREVIEW_INIT',
  'TESSELLATE_PREVIEW_UPDATE',
  'TESSELLATE_PREVIEW_READY',
  'TESSELLATE_PREVIEW_RESIZE',
  'TESSELLATE_PREVIEW_ERROR',
  'TESSELLATE_PREVIEW_NAVIGATION_REQUEST',
] as const;

export function isTessellatePreviewMessage(data: unknown): data is TessellatePreviewMessage {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const type = (data as { type?: unknown }).type;
  return typeof type === 'string' && (PREVIEW_MESSAGE_TYPES as readonly string[]).includes(type);
}

export function isParentToPreviewMessage(data: unknown): data is ParentToPreviewMessage {
  if (!isTessellatePreviewMessage(data)) return false;
  return data.type === 'TESSELLATE_PREVIEW_INIT' || data.type === 'TESSELLATE_PREVIEW_UPDATE';
}

export function isPreviewToParentMessage(data: unknown): data is PreviewToParentMessage {
  if (!isTessellatePreviewMessage(data)) return false;
  if (data.type === 'TESSELLATE_PREVIEW_NAVIGATION_REQUEST') {
    const message = data as { resourceId?: unknown; href?: unknown };
    return (
      typeof message.resourceId === 'string' &&
      message.resourceId.length > 0 &&
      message.resourceId.length <= 120 &&
      typeof message.href === 'string' &&
      message.href.length > 0 &&
      message.href.length <= 2048
    );
  }
  return (
    data.type === 'TESSELLATE_PREVIEW_READY' ||
    data.type === 'TESSELLATE_PREVIEW_RESIZE' ||
    data.type === 'TESSELLATE_PREVIEW_ERROR'
  );
}

/** Resolve a preview-requested link for a trusted parent confirmation control. */
export function resolvePreviewNavigationDestination(
  href: string,
  applicationOrigin: string,
): PreviewNavigationDestination | null {
  try {
    const applicationUrl = new URL(applicationOrigin);
    const destination = new URL(href, applicationUrl.origin);
    if (
      (destination.protocol !== 'http:' && destination.protocol !== 'https:') ||
      destination.username.length > 0 ||
      destination.password.length > 0
    ) {
      return null;
    }

    const external = destination.origin !== applicationUrl.origin;
    return {
      href: external
        ? destination.href
        : `${destination.pathname}${destination.search}${destination.hash}`,
      label: external
        ? destination.host
        : `${destination.pathname}${destination.search}${destination.hash}`,
      external,
    };
  } catch {
    return null;
  }
}
