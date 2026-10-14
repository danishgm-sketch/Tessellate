import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RegistryItem } from '@tessellate/registry';
import { loadConfig } from '../config.js';

export interface AddOptions {
  cwd?: string;
  overwrite?: boolean;
  registryDir?: string;
  /** Registry base URL override (e.g. https://tessellate.design/r). Takes precedence over tessellate.json. */
  registry?: string;
  dryRun?: boolean;
}

export type ResolveResult =
  | { status: 'found'; item: RegistryItem; source: string }
  | { status: 'not-found'; source: string }
  | { status: 'unreachable'; source: string; error: string };

export async function resolveRegistryItem(
  slug: string,
  cwd = process.cwd(),
  registryDir?: string,
  registryOverride?: string,
): Promise<ResolveResult> {
  // Normalize slug if user passes @tess/button-primary or button-primary
  const cleanSlug = slug.replace(/^@tess\//, '');

  // 1. Try local site public registry directory
  const localCandidates = [
    ...(registryDir ? [path.resolve(registryDir, `${cleanSlug}.json`), path.resolve(registryDir, `r/${cleanSlug}.json`)] : []),
    path.resolve(cwd, `apps/site/public/r/${cleanSlug}.json`),
    path.resolve(cwd, `../../apps/site/public/r/${cleanSlug}.json`),
    path.resolve(cwd, `../apps/site/public/r/${cleanSlug}.json`),
    path.resolve(cwd, `public/r/${cleanSlug}.json`),
  ];

  for (const candidate of localCandidates) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = fs.readFileSync(candidate, 'utf-8');
        return { status: 'found', item: JSON.parse(raw) as RegistryItem, source: candidate };
      } catch {
        // continue
      }
    }
  }

  // 2. Fetch from remote registry endpoint
  const config = loadConfig(cwd);
  const base = (registryOverride ?? config.registry).replace(/\/$/, '');
  const registryUrl = `${base}/${cleanSlug}.json`;
  try {
    const res = await fetch(registryUrl);
    if (res.ok) {
      return { status: 'found', item: (await res.json()) as RegistryItem, source: registryUrl };
    }
    if (res.status === 404) {
      return { status: 'not-found', source: registryUrl };
    }
    return { status: 'unreachable', source: registryUrl, error: `HTTP ${res.status}` };
  } catch (err) {
    return { status: 'unreachable', source: registryUrl, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Where a registry file is written: always inside a per-resource folder so installs never collide. */
export function installPath(componentsDir: string, slug: string, file: { path?: string; target?: string }): string {
  const fileName = (file.path || 'index.tsx').replace(/\\/g, '/').split('/').pop() || 'index.tsx';
  return path.join(componentsDir, slug, fileName);
}

export async function runAdd(slug: string, options: AddOptions = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const config = loadConfig(cwd);

  const cleanSlug = slug.replace(/^@tess\//, '');
  console.log(`[tess] Resolving resource "${cleanSlug}"...`);

  const resolved = await resolveRegistryItem(cleanSlug, cwd, options.registryDir, options.registry);
  if (resolved.status === 'not-found') {
    console.error(`[tess] Error: Resource "${cleanSlug}" does not exist in the registry (${resolved.source}).`);
    return { success: false, error: 'Resource not found' };
  }
  if (resolved.status === 'unreachable') {
    console.error(`[tess] Error: Could not reach the registry at ${resolved.source}: ${resolved.error}`);
    console.error(`[tess] Check your network, or pass --registry <url> / set "registry" in tessellate.json.`);
    return { success: false, error: 'Registry unreachable' };
  }

  const item = resolved.item;
  const conflicts: string[] = [];
  const planned = item.files.map((file) => ({ file, destination: path.join(cwd, installPath(config.componentsDir, cleanSlug, file)) }));

  for (const { destination } of planned) {
    if (fs.existsSync(destination) && !options.overwrite) conflicts.push(destination);
  }

  if (conflicts.length > 0) {
    for (const c of conflicts) {
      console.error(`[tess] Conflict: ${path.relative(cwd, c)} already exists.`);
    }
    console.error(`[tess] Nothing was installed. Re-run with --overwrite to replace the existing files.`);
    return { success: false, error: 'File conflict', conflicts };
  }

  const writtenFiles: string[] = [];
  for (const { file, destination } of planned) {
    if (options.dryRun) {
      console.log(`[tess] Would install: ${path.relative(cwd, destination)}`);
      continue;
    }
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, file.content, 'utf-8');
    writtenFiles.push(destination);
    console.log(`[tess] Installed: ${path.relative(cwd, destination)}`);
  }

  // Check required dependencies
  const dependencies = item.dependencies ?? [];
  const devDependencies = item.devDependencies ?? [];

  if (dependencies.length > 0 || devDependencies.length > 0) {
    console.log(`\n[tess] Required dependencies:`);
    if (dependencies.length > 0) {
      console.log(`  Runtime: pnpm add ${dependencies.join(' ')}`);
    }
    if (devDependencies.length > 0) {
      console.log(`  Dev:     pnpm add -D ${devDependencies.join(' ')}`);
    }
  }

  console.log(
    options.dryRun
      ? `[tess] Dry run complete for ${item.title || cleanSlug}; no files were written.\n`
      : `[tess] Added ${item.title || cleanSlug} (${writtenFiles.length} file${writtenFiles.length === 1 ? '' : 's'}).\n`,
  );
  return {
    success: true,
    item,
    writtenFiles,
    dependencies,
    devDependencies,
  };
}
