import * as fs from 'node:fs';
import * as path from 'node:path';

export interface DiscoveredResource {
  dir: string;
  manifestPath: string;
  slug: string;
  format: 'ts' | 'json';
}

/**
 * Recursively scans a root directory for resource folders containing manifest.ts or manifest.json.
 */
export function discoverResources(rootDir: string): DiscoveredResource[] {
  const discovered: DiscoveredResource[] = [];

  if (!fs.existsSync(rootDir)) {
    return discovered;
  }

  function scan(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    let hasManifest = false;
    let manifestFile = '';
    let format: 'ts' | 'json' = 'json';

    for (const entry of entries) {
      if (entry.isFile()) {
        if (entry.name === 'manifest.ts' || entry.name === 'manifest.js') {
          hasManifest = true;
          manifestFile = entry.name;
          format = 'ts';
          break;
        } else if (entry.name === 'manifest.json') {
          hasManifest = true;
          manifestFile = entry.name;
          format = 'json';
          break;
        }
      }
    }

    if (hasManifest) {
      const manifestPath = path.join(currentDir, manifestFile);
      const slug = path.basename(currentDir);
      discovered.push({
        dir: currentDir,
        manifestPath,
        slug,
        format,
      });
      // Do not recurse deeper inside a resource folder
      return;
    }

    // Otherwise, scan subdirectories
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
        scan(path.join(currentDir, entry.name));
      }
    }
  }

  scan(rootDir);

  // Return sorted deterministically by slug
  return discovered.sort((a, b) => a.slug.localeCompare(b.slug));
}
