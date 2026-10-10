import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RegistryItem } from '@tessellate/registry';
import { loadConfig } from '../config.js';

export interface AddOptions {
  cwd?: string;
  overwrite?: boolean;
  registryDir?: string;
}

export async function resolveRegistryItem(
  slug: string,
  cwd = process.cwd(),
  registryDir?: string,
): Promise<RegistryItem | null> {
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
        return JSON.parse(raw) as RegistryItem;
      } catch {
        // continue
      }
    }
  }

  // 2. Fetch from remote registry endpoint
  const config = loadConfig(cwd);
  const registryUrl = `${config.registry.replace(/\/$/, '')}/${cleanSlug}.json`;
  try {
    const res = await fetch(registryUrl);
    if (res.ok) {
      return (await res.json()) as RegistryItem;
    }
  } catch {
    // network failure
  }

  return null;
}

export async function runAdd(slug: string, options: AddOptions = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const config = loadConfig(cwd);

  const cleanSlug = slug.replace(/^@tess\//, '');
  console.log(`[tess] Resolving resource "${cleanSlug}"...`);

  const item = await resolveRegistryItem(cleanSlug, cwd, options.registryDir);
  if (!item) {
    console.error(`[tess] Error: Resource "${cleanSlug}" could not be found in local or remote registry.`);
    return { success: false, error: 'Resource not found' };
  }

  const targetDir = path.join(cwd, config.componentsDir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const writtenFiles: string[] = [];

  for (const file of item.files) {
    const fileName = path.basename(file.path || `${item.name}.tsx`);
    const destinationPath = path.join(targetDir, fileName);

    if (fs.existsSync(destinationPath) && !options.overwrite) {
      console.warn(`[tess] Warning: File ${destinationPath} already exists. Use --overwrite to replace.`);
      continue;
    }

    fs.writeFileSync(destinationPath, file.content, 'utf-8');
    writtenFiles.push(destinationPath);
    console.log(`[tess] Installed: ${path.relative(cwd, destinationPath)}`);
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

  console.log(`[tess] Successfully added ${item.title || cleanSlug}!\n`);
  return {
    success: true,
    item,
    writtenFiles,
    dependencies,
    devDependencies,
  };
}
