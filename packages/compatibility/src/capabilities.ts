import { isGoldResource } from '@tessellate/catalog/gold';
import type { ResourceManifest } from '@tessellate/schemas';

export interface ResourceCapability {
  slug: string;
  inCatalog: boolean;
  runtimeRenderable: boolean;
  browserExportable: boolean;
  variants: readonly string[];
}

/**
 * Checks whether a resource possesses complete runtime rendering and browser export capabilities.
 * For V1, the Gold 40 resources represent the guaranteed-safe, fully verified composition universe.
 */
export function isResourceCompositionCapable(
  resource: ResourceManifest | { slug: string; runtimeRenderable?: boolean; browserExportable?: boolean }
): boolean {
  if (!resource || !resource.slug) return false;
  if (!isGoldResource(resource.slug)) return false;

  const declaredCapabilities = resource as { runtimeRenderable?: boolean; browserExportable?: boolean };
  return declaredCapabilities.runtimeRenderable !== false && declaredCapabilities.browserExportable !== false;
}

/**
 * Enforces the runtime/export capability invariant for V1 deterministic composition.
 * Rejects any candidate that does not have verified runtime rendering and browser-exportable source.
 */
export function isResourceComposerEligible(resource: ResourceManifest): boolean {
  if (!resource.id || !resource.slug) return false;
  if (!resource.variants || resource.variants.length === 0) return false;
  const declaredVariants = new Set(resource.variants.map((variant) => variant.id.toLowerCase()));
  if (!['quiet', 'expressive', 'nocturne'].every((variant) => declaredVariants.has(variant))) return false;
  return isResourceCompositionCapable(resource);
}

/**
 * Returns capability inspection metadata for a given resource slug.
 */
export function getResourceCapabilities(slug: string): ResourceCapability {
  const isGold = isGoldResource(slug);
  return {
    slug,
    inCatalog: isGold,
    runtimeRenderable: isGold,
    browserExportable: isGold,
    variants: isGold ? ['quiet', 'expressive', 'nocturne'] : [],
  };
}
