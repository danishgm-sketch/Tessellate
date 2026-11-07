import { BASE_RESOURCE_RENDERERS } from './base-registry.js';
import { createNodeRenderer } from './node-renderer-core.js';

/**
 * Renderer for the isolated resource preview app. The app loads the selected
 * resource source itself, so it does not need the Workbench's full Gold map.
 */
export const BrowserPreviewNodeRenderer = createNodeRenderer(BASE_RESOURCE_RENDERERS);

export function getBrowserPreviewBaseRenderer(resourceId: string) {
  return BASE_RESOURCE_RENDERERS[resourceId];
}
