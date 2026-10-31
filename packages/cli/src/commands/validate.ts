import * as fs from 'node:fs';
import * as path from 'node:path';
import { ResourceManifestSchema, ProjectManifestSchema } from '@tessellate/schemas';
import { findConfigFile, loadConfig } from '../config.js';

export interface ValidateResult {
  valid: boolean;
  type?: 'resource' | 'project';
  errors?: string[];
}

export async function runValidate(filePath: string): Promise<ValidateResult> {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`[tess] File not found: ${filePath}`);
    return { valid: false, errors: [`File not found: ${filePath}`] };
  }

  let content: unknown;
  try {
    const raw = fs.readFileSync(fullPath, 'utf-8');
    content = JSON.parse(raw);
  } catch (err) {
    console.error(`[tess] Failed to parse JSON in ${filePath}:`, (err as Error).message);
    return { valid: false, errors: [`Invalid JSON: ${(err as Error).message}`] };
  }

  if (typeof content !== 'object' || content === null) {
    console.error('[tess] Manifest must be a JSON object.');
    return { valid: false, errors: ['Manifest must be a JSON object'] };
  }

  // Parse against both canonical contracts. ProjectManifest uses `screens` and
  // `designDNA`; it does not have the legacy `nodes` or `canvas` markers.
  const obj = content as Record<string, unknown>;
  const resourceResult = ResourceManifestSchema.safeParse(obj);
  if (resourceResult.success) {
    const manifest = resourceResult.data;
    console.log(`[tess] Valid ResourceManifest: ${manifest.name} (${manifest.slug}) v${manifest.version}`);
    return { valid: true, type: 'resource' };
  }

  const projectResult = ProjectManifestSchema.safeParse(obj);
  if (projectResult.success) {
    const manifest = projectResult.data;
    console.log(`[tess] Valid ProjectManifest: ${manifest.name} (${manifest.screens.length} screens)`);
    return { valid: true, type: 'project' };
  }

  const looksLikeResource = 'resourceType' in obj || 'license' in obj || 'slug' in obj;
  const looksLikeProject = 'screens' in obj || 'productModel' in obj || 'designDNA' in obj;
  const type = looksLikeResource ? 'resource' : looksLikeProject ? 'project' : undefined;
  const issues = type === 'resource' ? resourceResult.error.issues : projectResult.error.issues;
  const errors = issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);

  if (!type) {
    errors.unshift('Unknown manifest format. Expected a ResourceManifest or ProjectManifest.');
  } else {
    console.error(`[tess] Validation failed for ${type === 'resource' ? 'ResourceManifest' : 'ProjectManifest'} in ${filePath}:`);
  }
  for (const error of errors) console.error(error);
  return { valid: false, type, errors };
}

export async function runDoctor(cwd = process.cwd()) {
  console.log('[tess] Running Tessellate environment diagnostic...\n');

  // 1. Node.js version
  const nodeVersion = process.version;
  console.log(`  ✓ Node.js Runtime: ${nodeVersion}`);

  // 2. Configuration file
  const configFile = findConfigFile(cwd);
  if (configFile) {
    console.log(`  ✓ Tessellate Config: Found (${path.relative(cwd, configFile)})`);
  } else {
    console.log(`  ⚠ Tessellate Config: Not found (run 'tess init' to configure)`);
  }

  const config = loadConfig(cwd);

  // 3. Components directory
  const componentsPath = path.resolve(cwd, config.componentsDir);
  if (fs.existsSync(componentsPath)) {
    console.log(`  ✓ Components Directory: ${config.componentsDir} exists`);
  } else {
    console.log(`  ⚠ Components Directory: ${config.componentsDir} does not exist`);
  }

  // 4. Tokens stylesheet
  const tokensPath = path.resolve(cwd, config.tokensPath);
  if (fs.existsSync(tokensPath)) {
    console.log(`  ✓ Semantic Tokens: ${config.tokensPath} exists`);
  } else {
    console.log(`  ⚠ Semantic Tokens: ${config.tokensPath} missing`);
  }

  // 5. Tailwind setup
  const tailwindCandidates = [
    path.resolve(cwd, 'tailwind.config.js'),
    path.resolve(cwd, 'tailwind.config.ts'),
    path.resolve(cwd, 'tailwind.config.mjs'),
    path.resolve(cwd, 'src/styles/global.css'),
    path.resolve(cwd, 'src/index.css'),
  ];
  const hasTailwind = tailwindCandidates.some((p) => fs.existsSync(p));
  if (hasTailwind) {
    console.log(`  ✓ Tailwind CSS: Configuration / style file detected`);
  } else {
    console.log(`  ⚠ Tailwind CSS: No tailwind config or global stylesheet found`);
  }

  console.log('\n[tess] Diagnostic check complete.');
  return { nodeVersion, hasConfig: Boolean(configFile), hasTokens: fs.existsSync(tokensPath) };
}
