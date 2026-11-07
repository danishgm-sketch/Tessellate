import { ProjectManifestSchema } from '@tessellate/schemas';
import type { ProjectNode } from '@tessellate/schemas';
import { preloadGoldResources } from './generated-gold-registry.js';

export { BrowserNodeRenderer } from './browser-node-renderer.js';
export { BrowserManifestRenderer } from './browser-manifest-renderer.js';
export { preloadGoldResources as preloadBrowserResources } from './generated-gold-registry.js';

function collectInitialViewportSlugs(node: ProjectNode | undefined): string[] {
  if (!node) return [];
  const contentChildren = node.children.filter((child) => child.semanticRole !== 'navigation');
  const initialChildren = contentChildren.slice(0, 1);
  return [
    ...(node.resourceRef ? [node.resourceRef.slug] : []),
    ...(initialChildren.length > 0 ? initialChildren : node.children.slice(0, 1))
      .flatMap((child) => collectResourceSlugs(child)),
  ];
}

function collectResourceSlugs(node: ProjectNode): string[] {
  return [
    ...(node.resourceRef ? [node.resourceRef.slug] : []),
    ...node.children.flatMap(collectResourceSlugs),
  ];
}

export function getInitialViewportResourceSlugs(node: ProjectNode | undefined): string[] {
  return [...new Set(collectInitialViewportSlugs(node))];
}

export async function preloadInitialViewportResources(node: ProjectNode | undefined): Promise<void> {
  const slugs = getInitialViewportResourceSlugs(node);
  await Promise.allSettled(slugs.map((slug) => preloadGoldResources([slug])));
}

export async function preloadManifestInitialViewportResources(rawManifest: unknown, screenId?: string): Promise<void> {
  const manifest = ProjectManifestSchema.parse(rawManifest);
  const screen = manifest.screens.find((item) => item.id === screenId) ?? manifest.screens[0];
  await preloadInitialViewportResources(screen?.rootNode);
}
