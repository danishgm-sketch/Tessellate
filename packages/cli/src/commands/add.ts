import * as fs from 'node:fs';
import * as path from 'node:path';
import { ResourceSlugSchema } from '@tessellate/schemas';
import type { RegistryItem } from '@tessellate/registry';
import { loadConfig, resolveProjectPath } from '../config.js';
import { fetchRegistryResponse, readBoundedJsonResponse, RegistryPolicyError } from '../registry-io.js';

const MAX_REGISTRY_ITEM_BYTES = 1024 * 1024;
const MAX_RESOURCE_FILE_BYTES = 256 * 1024;
const REGISTRY_ITEM_TYPES = new Set(['registry:ui', 'registry:component', 'registry:block', 'registry:hook', 'registry:lib']);

function isBoundedStringArray(value: unknown): value is string[] {
  return value === undefined || (
    Array.isArray(value) &&
    value.length <= 100 &&
    value.every((item) => typeof item === 'string' && item.length <= 120)
  );
}

function parseRegistryItem(value: unknown): RegistryItem | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (
    typeof item.name !== 'string' || item.name.trim().length === 0 || item.name.length > 120 ||
    typeof item.type !== 'string' || !REGISTRY_ITEM_TYPES.has(item.type) ||
    !Array.isArray(item.files) || item.files.length === 0 || item.files.length > 20 ||
    !isBoundedStringArray(item.dependencies) ||
    !isBoundedStringArray(item.devDependencies) ||
    !isBoundedStringArray(item.registryDependencies)
  ) return null;

  let totalFileBytes = 0;
  for (const file of item.files) {
    if (typeof file !== 'object' || file === null || Array.isArray(file)) return null;
    const candidate = file as Record<string, unknown>;
    if (
      typeof candidate.path !== 'string' || candidate.path.length === 0 || candidate.path.length > 512 ||
      typeof candidate.content !== 'string' ||
      typeof candidate.type !== 'string' || !REGISTRY_ITEM_TYPES.has(candidate.type)
    ) return null;
    const fileBytes = Buffer.byteLength(candidate.content, 'utf8');
    totalFileBytes += fileBytes;
    if (fileBytes > MAX_RESOURCE_FILE_BYTES || totalFileBytes > MAX_RESOURCE_FILE_BYTES * 2) return null;
  }

  for (const field of ['title', 'description'] as const) {
    if (item[field] !== undefined && (typeof item[field] !== 'string' || item[field].length > 2_000)) return null;
  }
  return item as unknown as RegistryItem;
}

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
  const cleanSlug = slug.trim().replace(/^@tess\//, '');
  if (!ResourceSlugSchema.safeParse(cleanSlug).success) return null;

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
        if (fs.statSync(candidate).size > MAX_REGISTRY_ITEM_BYTES) continue;
        const raw = fs.readFileSync(candidate, 'utf-8');
        const item = parseRegistryItem(JSON.parse(raw) as unknown);
        if (item) return item;
      } catch {
        // continue
      }
    }
  }

  // 2. Fetch from remote registry endpoint
  const config = loadConfig(cwd);
  const registryUrl = `${config.registry.replace(/\/$/, '')}/${cleanSlug}.json`;
  try {
    const res = await fetchRegistryResponse(registryUrl, MAX_REGISTRY_ITEM_BYTES, 'Registry item');
    if (res.ok) {
      return parseRegistryItem(await readBoundedJsonResponse(res, MAX_REGISTRY_ITEM_BYTES, 'Registry item'));
    }
  } catch (error) {
    if (error instanceof RegistryPolicyError) throw error;
    // network failure
  }

  return null;
}

export async function runAdd(slug: string, options: AddOptions = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const config = loadConfig(cwd);

  const cleanSlug = slug.trim().replace(/^@tess\//, '');
  if (!ResourceSlugSchema.safeParse(cleanSlug).success) {
    console.error(`[tess] Error: Invalid resource slug "${cleanSlug}".`);
    return { success: false, error: 'Invalid resource slug' };
  }
  const targetDir = resolveProjectPath(cwd, config.componentsDir, 'componentsDir');
  console.log(`[tess] Resolving resource "${cleanSlug}"...`);

  const item = await resolveRegistryItem(cleanSlug, cwd, options.registryDir);
  if (!item) {
    console.error(`[tess] Error: Resource "${cleanSlug}" could not be found in local or remote registry.`);
    return { success: false, error: 'Resource not found' };
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const writtenFiles: string[] = [];

  for (const file of item.files) {
    const fileName = path.basename(file.path || `${item.name}.tsx`);
    if (fileName === '.' || fileName === '..' || !fileName.trim()) {
      throw new Error('[tess] Registry item contains an invalid output filename.');
    }
    const destinationPath = resolveProjectPath(
      cwd,
      path.relative(cwd, path.join(targetDir, fileName)),
      'resource output file'
    );

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
