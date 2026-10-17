import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setDiskResourceResolver, type ResolvedResource } from './source-tree.js';

function toPascalCase(str: string): string {
  const clean = str.replace(/[^a-zA-Z0-9]/g, ' ').trim();
  const words = clean.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return words.join('') || 'Component';
}

function getAcceptedPropNames(code: string): Set<string> | null {
  const propsMatch = code.match(/interface\s+[A-Za-z0-9_]+Props(?:\s+extends[^{]+)?\s*\{([^}]+)\}/s);
  if (!propsMatch || !propsMatch[1]) return null;
  const propsBody = propsMatch[1];
  const names = new Set<string>();
  const lineMatches = propsBody.matchAll(/([a-zA-Z0-9_]+)\s*\??\s*:/g);
  for (const m of lineMatches) {
    if (m[1]) {
      names.add(m[1]);
    }
  }
  return names;
}

export function resolveResourceFromDisk(slug: string): ResolvedResource | null {
  try {
    let currentDir = process.cwd();
    try {
      const currentFilePath = fileURLToPath(import.meta.url);
      currentDir = path.dirname(currentFilePath);
    } catch {
      // fallback
    }

    const searchRoots = [
      path.resolve(process.cwd(), 'resources'),
      path.resolve(process.cwd(), '../../resources'),
      path.resolve(currentDir, '../../../../resources'),
      path.resolve(currentDir, '../../../resources'),
    ];

    for (const root of searchRoots) {
      if (!fs.existsSync(root)) continue;

      const categories = fs.readdirSync(root);
      for (const cat of categories) {
        const catDir = path.join(root, cat);
        if (!fs.statSync(catDir).isDirectory()) continue;

        const resourceDir = path.join(catDir, slug);
        const indexPath = path.join(resourceDir, 'index.tsx');
        if (fs.existsSync(indexPath)) {
          const code = fs.readFileSync(indexPath, 'utf-8');
          const match =
            code.match(/export\s+(?:function|const)\s+([A-Za-z0-9_]+)/) ||
            code.match(/export\s+default\s+(?:function\s+)?([A-Za-z0-9_]+)/);
          const componentName = match?.[1] ?? toPascalCase(slug);
          const acceptedProps = getAcceptedPropNames(code);

          let deps: string[] = [];
          let acceptedVariants: string[] | undefined;
          const manifestPath = path.join(resourceDir, 'manifest.json');
          if (fs.existsSync(manifestPath)) {
            try {
              const manifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
              if (Array.isArray(manifestJson.dependencies)) {
                deps = manifestJson.dependencies;
              }
              if (Array.isArray(manifestJson.variants)) {
                acceptedVariants = manifestJson.variants.flatMap((variant: unknown) => {
                  if (!variant || typeof variant !== 'object' || !('id' in variant)) return [];
                  const id = (variant as { id?: unknown }).id;
                  return typeof id === 'string' ? [id] : [];
                });
              }
            } catch {
              // ignore
            }
          }

          return {
            slug,
            componentName,
            fileName: `${componentName}.tsx`,
            code,
            acceptedProps,
            acceptedVariants,
            dependencies: deps,
          };
        }
      }
    }
  } catch {
    // Non-filesystem or sandboxed environment
  }
  return null;
}

// Auto-register disk resolver when this module is imported in Node
setDiskResourceResolver(resolveResourceFromDisk);
