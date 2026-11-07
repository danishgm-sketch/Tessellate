import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ResourceSlugSchema } from '@tessellate/schemas';
import { setDiskResourceResolver, type ResolvedResource } from './source-tree.js';

function isWithinDirectory(directory: string, candidate: string): boolean {
  const relativePath = path.relative(directory, candidate);
  return (
    relativePath !== '' &&
    relativePath !== '..' &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
}

function resolveRegularFileWithin(resourceDir: string, relativePath: string): string | null {
  try {
    const resourceRoot = fs.realpathSync(resourceDir);
    const candidate = path.resolve(resourceRoot, relativePath);
    if (!isWithinDirectory(resourceRoot, candidate)) return null;

    const stat = fs.lstatSync(candidate);
    if (stat.isSymbolicLink() || !stat.isFile()) return null;

    const realCandidate = fs.realpathSync(candidate);
    return isWithinDirectory(resourceRoot, realCandidate) ? realCandidate : null;
  } catch {
    return null;
  }
}

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
  if (!ResourceSlugSchema.safeParse(slug).success) return null;

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

      const rootStat = fs.lstatSync(root);
      if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) continue;

      const resourceRoot = fs.realpathSync(root);
      const categories = fs.readdirSync(resourceRoot, { withFileTypes: true });
      for (const category of categories) {
        if (!category.isDirectory() || category.isSymbolicLink()) continue;

        const categoryDir = path.join(resourceRoot, category.name);
        const resourceDir = path.resolve(categoryDir, slug);
        if (!isWithinDirectory(categoryDir, resourceDir)) continue;

        let resourceStat: fs.Stats;
        let canonicalResourceDir: string;
        try {
          resourceStat = fs.lstatSync(resourceDir);
          if (!resourceStat.isDirectory() || resourceStat.isSymbolicLink()) continue;
          canonicalResourceDir = fs.realpathSync(resourceDir);
        } catch {
          continue;
        }
        if (!isWithinDirectory(categoryDir, canonicalResourceDir)) continue;

        const indexPath = resolveRegularFileWithin(canonicalResourceDir, 'index.tsx');
        if (indexPath) {
          const code = fs.readFileSync(indexPath, 'utf-8');
          const match =
            code.match(/export\s+(?:function|const)\s+([A-Za-z0-9_]+)/) ||
            code.match(/export\s+default\s+(?:function\s+)?([A-Za-z0-9_]+)/);
          const componentName = match?.[1] ?? toPascalCase(slug);
          const acceptedProps = getAcceptedPropNames(code);

          let deps: string[] = [];
          let acceptedVariants: string[] | undefined;
          const manifestPath = resolveRegularFileWithin(canonicalResourceDir, 'manifest.json');
          if (manifestPath) {
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
