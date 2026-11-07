import type { ResourceRendererMap } from './types.js';
import { BASE_RESOURCE_RENDERERS } from './base-registry.js';
import { GENERATED_GOLD_RENDERERS_SYNC } from './generated-gold-registry-sync.js';

export const DEFAULT_RESOURCE_RENDERERS: ResourceRendererMap = {
  ...BASE_RESOURCE_RENDERERS,
  ...GENERATED_GOLD_RENDERERS_SYNC,
};
