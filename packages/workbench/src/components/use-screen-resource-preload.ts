import { useEffect, useMemo, useState } from 'react';
import { preloadBrowserResources } from '@tessellate/renderer/browser';
import type { ProjectNode } from '@tessellate/schemas';

function collectResourceSlugs(node: ProjectNode | undefined): string[] {
  if (!node) return [];
  return [
    ...(node.resourceRef ? [node.resourceRef.slug] : []),
    ...node.children.flatMap(collectResourceSlugs),
  ];
}

/** Resolve a screen's Gold chunks before mounting its renderer to avoid per-node fallback reflow. */
export function useScreenResourcePreload(rootNode: ProjectNode | undefined, screenIdentity: string): boolean {
  const resourceSlugs = useMemo(() => [...new Set(collectResourceSlugs(rootNode))], [rootNode]);
  const resourceKey = `${screenIdentity}:${resourceSlugs.join(',')}`;
  const [loadedResourceKey, setLoadedResourceKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.allSettled(resourceSlugs.map((slug) => preloadBrowserResources([slug])))
      .then(() => {
        // Wait for every resource attempt so a partial failure cannot mount the screen while other chunks remain pending.
        // The renderer boundary will show the specific load failure once the full attempt set has settled.
        if (!cancelled) setLoadedResourceKey(resourceKey);
      });
    return () => {
      cancelled = true;
    };
  }, [resourceKey, resourceSlugs]);

  return loadedResourceKey === resourceKey;
}
