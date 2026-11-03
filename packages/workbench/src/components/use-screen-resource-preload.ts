import { useEffect, useMemo, useState } from 'react';
import { getInitialViewportResourceSlugs, preloadInitialViewportResources } from '@tessellate/renderer/browser';
import type { ProjectNode } from '@tessellate/schemas';

/** Resolve first-viewport Gold chunks before mounting to prevent visible reflow. */
export function useScreenResourcePreload(rootNode: ProjectNode | undefined, screenIdentity: string): boolean {
  const resourceSlugs = useMemo(() => getInitialViewportResourceSlugs(rootNode), [rootNode]);
  const resourceKey = `${screenIdentity}:${resourceSlugs.join(',')}`;
  const [loadedResourceKey, setLoadedResourceKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void preloadInitialViewportResources(rootNode)
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
