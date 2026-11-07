import { BASE_RESOURCE_RENDERERS } from './base-registry.js';
import { GENERATED_GOLD_RENDERERS } from './generated-gold-registry.js';
import { createNodeRenderer } from './node-renderer-core.js';

export const BrowserNodeRenderer = createNodeRenderer({
  ...BASE_RESOURCE_RENDERERS,
  ...GENERATED_GOLD_RENDERERS,
});
