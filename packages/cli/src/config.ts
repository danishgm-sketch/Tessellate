import * as fs from 'node:fs';
import * as path from 'node:path';

export interface TessellateConfig {
  $schema?: string;
  version: string;
  registry: string;
  componentsDir: string;
  tokensPath: string;
  tailwindVersion: string;
}

export const DEFAULT_CONFIG: TessellateConfig = {
  $schema: 'https://tessellate.design/schema/config.json',
  version: '0.1.0',
  registry: 'https://tessellate.design/r',
  componentsDir: 'components/ui',
  tokensPath: 'styles/tokens.css',
  tailwindVersion: '4',
};

export const CONFIG_FILE_NAME = 'tessellate.json';

export function findConfigFile(startDir = process.cwd()): string | null {
  let current = path.resolve(startDir);
  while (true) {
    const candidate = path.join(current, CONFIG_FILE_NAME);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return null;
}

/** Resolve config-controlled output paths without allowing traversal or symlink escapes. */
export function resolveProjectPath(projectRoot: string, relativePath: string, fieldName: string): string {
  if (path.isAbsolute(relativePath)) {
    throw new Error(`[tess] Configured ${fieldName} must be a relative path inside the project directory.`);
  }

  const root = path.resolve(projectRoot);
  const target = path.resolve(root, relativePath);
  const relativeTarget = path.relative(root, target);
  if (relativeTarget === '..' || relativeTarget.startsWith(`..${path.sep}`) || path.isAbsolute(relativeTarget)) {
    throw new Error(`[tess] Configured ${fieldName} must stay inside the project directory.`);
  }

  let existingAncestor = target;
  while (true) {
    try {
      fs.lstatSync(existingAncestor);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      const parent = path.dirname(existingAncestor);
      if (parent === existingAncestor) throw new Error(`[tess] Could not resolve configured ${fieldName}.`);
      existingAncestor = parent;
    }
  }

  const realRoot = fs.realpathSync.native(root);
  const realAncestor = fs.realpathSync.native(existingAncestor);
  const realRelative = path.relative(realRoot, realAncestor);
  if (realRelative === '..' || realRelative.startsWith(`..${path.sep}`) || path.isAbsolute(realRelative)) {
    throw new Error(`[tess] Configured ${fieldName} resolves outside the project directory through a symlink.`);
  }
  return target;
}

export function loadConfig(startDir = process.cwd()): TessellateConfig {
  const configFile = findConfigFile(startDir);
  if (!configFile) {
    return DEFAULT_CONFIG;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid Tessellate configuration at ${configFile}: ${detail}`);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`Invalid Tessellate configuration at ${configFile}: expected a JSON object.`);
  }

  const candidate = parsed as Record<string, unknown>;
  const stringFields = ['version', 'registry', 'componentsDir', 'tokensPath', 'tailwindVersion'] as const;
  for (const field of stringFields) {
    if (candidate[field] !== undefined && (typeof candidate[field] !== 'string' || candidate[field].trim() === '')) {
      throw new Error(`Invalid Tessellate configuration at ${configFile}: "${field}" must be a non-empty string.`);
    }
  }

  return { ...DEFAULT_CONFIG, ...candidate } as TessellateConfig;
}

export function saveConfig(config: TessellateConfig, targetDir = process.cwd()): string {
  const filePath = resolveProjectPath(targetDir, CONFIG_FILE_NAME, 'configuration file');
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
  return filePath;
}
