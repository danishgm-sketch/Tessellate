import { RESOURCE_VARIANTS } from './generated-resource-variants.js';
export { nodeRuntimeVariant } from './layout-contract.js';

/** Returns the certified runtime variants for a canonical resource reference. */
export function getSupportedResourceVariants(slug: string, id?: string): readonly string[] | undefined {
  return RESOURCE_VARIANTS[slug] ?? (id ? RESOURCE_VARIANTS[id] : undefined);
}
