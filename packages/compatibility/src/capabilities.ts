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
 * Checks that a resource can actually be composed: it ships component source the exporter can copy, it is
 * not deprecated, and (when the caller knows the runtime registry) the renderer can mount it.
 */
export function isResourceCompositionCapable(
  resource: Pick<ResourceManifest, 'slug'> & Partial<Pick<ResourceManifest, 'files' | 'status'>>,
  isRenderable?: (slug: string) => boolean
): boolean {
  if (!resource || !resource.slug) return false;
  if (resource.status === 'deprecated') return false;
  const hasComponentSource = (resource.files ?? []).some((f) => f.kind === 'component' && /^index\.(t|j)sx?$/.test(f.path));
  if (!hasComponentSource) return false;
  return isRenderable ? isRenderable(resource.slug) : true;
}

/** A resource the composer may place: capable, with at least one declared variant. */
export function isResourceComposerEligible(resource: ResourceManifest, isRenderable?: (slug: string) => boolean): boolean {
  if (!resource.id || !resource.slug) return false;
  if (!resource.variants || resource.variants.length === 0) return false;
  return isResourceCompositionCapable(resource, isRenderable);
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
