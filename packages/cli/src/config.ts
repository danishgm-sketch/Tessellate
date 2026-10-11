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

export function loadConfig(startDir = process.cwd()): TessellateConfig {
  const configFile = findConfigFile(startDir);
  if (!configFile) {
    return DEFAULT_CONFIG;
  }
  try {
    const raw = fs.readFileSync(configFile, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: TessellateConfig, targetDir = process.cwd()): string {
  const filePath = path.join(path.resolve(targetDir), CONFIG_FILE_NAME);
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
  return filePath;
}
