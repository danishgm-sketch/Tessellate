import * as path from 'node:path';
import { discoverResources, loadJsonManifest } from '@tessellate/catalog';
import { GOLD_40_SLUGS } from '@tessellate/catalog/gold';
import type { ProjectManifest, ProjectNode, ResourceManifest } from '@tessellate/schemas';
import { validProjectFixture } from '@tessellate/schemas';

/** Load the canonical Gold manifests so parity fixtures use real resource IDs and contracts. */
export function loadGoldResourceManifests(resourceRoot = path.resolve(process.cwd(), 'resources')): ResourceManifest[] {
  const discovered = discoverResources(resourceRoot);
  const bySlug = new Map(discovered.map((resource) => [resource.slug, resource]));

  return GOLD_40_SLUGS.map((slug) => {
    const resource = bySlug.get(slug);
    if (!resource) throw new Error(`Gold parity fixture could not find resource "${slug}" under ${resourceRoot}.`);
    if (resource.format !== 'json') throw new Error(`Gold parity fixture requires a JSON manifest for "${slug}".`);
    return loadJsonManifest(resource.manifestPath);
  });
}

function declaredSlots(resource: ResourceManifest): Record<string, unknown> {
  return Object.fromEntries(
    (resource.slots ?? [])
      .filter((slot) => slot.defaultValue !== undefined)
      .map((slot) => [slot.id, slot.defaultValue]),
  );
}

/** One canonical manifest node for each Gold resource and each declared runtime variant. */
export function createGoldResourceVariantParityNodes(
  resources: readonly ResourceManifest[] = loadGoldResourceManifests(),
): ProjectNode[] {
  return resources.flatMap((resource) =>
    resource.variants.map((variant) => {
      const variantId = variant.id || variant.name.toLowerCase();
      const defaultProps = { ...(resource.preview?.defaultProps ?? {}) };
      if (resource.slug === 'dialog') defaultProps.open = variantId === 'quiet';
      return {
        id: `gold-parity-${resource.slug}-${variantId}`,
        nodeType: 'component' as const,
        semanticRole: resource.roles[0] ?? 'component',
        resourceRef: { id: resource.id, slug: resource.slug, version: resource.version },
        variant: variantId,
        props: defaultProps,
        slots: declaredSlots(resource),
        children: [],
      };
    }),
  );
}

/** Shared, data-backed fixture for Workbench, Preview and standalone-export browser checks. */
export function createGoldResourceVariantParityProject(): ProjectManifest {
  const project = structuredClone(validProjectFixture);
  project.id = 'gold-resource-variant-parity-fixture';
  project.name = 'Gold resource variant parity fixture';
  project.description = 'Canonical Gold resources rendered through Workbench, Preview and standalone export.';
  project.locks = [];
  project.screens[0]!.rootNode = {
    id: 'gold-resource-parity-root',
    nodeType: 'layout',
    semanticRole: 'container',
    props: {},
    slots: {},
    children: createGoldResourceVariantParityNodes(),
  };
  return project;
}

export function appendGoldResourceVariantParityNodes(project: ProjectManifest): ProjectManifest {
  const augmented = structuredClone(project);
  const screen = augmented.screens[0];
  if (!screen) throw new Error('Gold resource parity fixture requires at least one screen.');
  screen.rootNode.children.push(...createGoldResourceVariantParityNodes());
  return augmented;
}
