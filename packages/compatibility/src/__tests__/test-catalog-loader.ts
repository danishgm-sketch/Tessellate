import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';

let cachedCatalog: ResourceManifest[] | null = null;

export function loadTestCatalog(): ResourceManifest[] {
  if (cachedCatalog && cachedCatalog.length > 0) {
    return cachedCatalog;
  }

  const candidatePaths = [
    path.resolve(process.cwd(), 'apps/site/public/data/catalog.json'),
    path.resolve(process.cwd(), '../../apps/site/public/data/catalog.json'),
    path.resolve(process.cwd(), '../../../apps/site/public/data/catalog.json'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.resources)) {
          cachedCatalog = parsed.resources;
          return cachedCatalog!;
        }
      } catch {
        // ignore and try next
      }
    }
  }

  return [];
}
