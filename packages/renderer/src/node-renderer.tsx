import { DEFAULT_RESOURCE_RENDERERS } from './default-registry.js';
import { createNodeRenderer } from './node-renderer-core.js';

export const NodeRenderer = createNodeRenderer(DEFAULT_RESOURCE_RENDERERS);
