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

export type ParentToPreviewMessage = PreviewInitMessage | PreviewUpdateMessage;
export type PreviewToParentMessage = PreviewReadyMessage | PreviewResizeMessage | PreviewErrorMessage;
export type TessellatePreviewMessage = ParentToPreviewMessage | PreviewToParentMessage;

export const PREVIEW_MESSAGE_TYPES = [
  'TESSELLATE_PREVIEW_INIT',
  'TESSELLATE_PREVIEW_UPDATE',
  'TESSELLATE_PREVIEW_READY',
  'TESSELLATE_PREVIEW_RESIZE',
  'TESSELLATE_PREVIEW_ERROR',
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
  return (
    data.type === 'TESSELLATE_PREVIEW_READY' ||
    data.type === 'TESSELLATE_PREVIEW_RESIZE' ||
    data.type === 'TESSELLATE_PREVIEW_ERROR'
  );
}
