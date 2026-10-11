import * as fs from 'node:fs';
import * as path from 'node:path';
import { ResourceManifestSchema, type ResourceManifest } from '@tessellate/schemas';
import { validateLicense } from './licenses.js';

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  field?: string;
}

export interface ResourceValidationResult {
  valid: boolean;
  resourceId: string;
  slug: string;
  errors: string[];
  warnings: string[];
  manifest?: ResourceManifest;
}

/**
 * Validates a resource folder and its manifest against all Tessellate launch requirements.
 */
export function validateResource(
  resourceDir: string,
  rawManifest: unknown
): ResourceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validate Schema
  const parseResult = ResourceManifestSchema.safeParse(rawManifest);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.errors.map(
      (e) => `${e.path.join('.')}: ${e.message}`
    );
    return {
      valid: false,
      resourceId: (rawManifest as { id?: string })?.id ?? 'unknown',
      slug: (rawManifest as { slug?: string })?.slug ?? 'unknown',
      errors: [`Schema validation failed:\n  ${errorDetails.join('\n  ')}`],
      warnings,
    };
  }

  const manifest = parseResult.data;
  const resourceId = manifest.id;
  const slug = manifest.slug;

  // 2. Validate License
  const licenseResult = validateLicense(manifest.license);
  if (!licenseResult.valid && licenseResult.error) {
    errors.push(`License error: ${licenseResult.error}`);
  }

  // 3. Validate File Existence
  for (const file of manifest.files) {
    const fullPath = path.join(resourceDir, file.path);
    if (!fs.existsSync(fullPath)) {
      if (file.required) {
        errors.push(`Required file missing: '${file.path}' at ${fullPath}`);
      } else {
        warnings.push(`Optional file missing: '${file.path}' at ${fullPath}`);
      }
    }
  }

  // 4. Validate Quality Score Policy
  if (manifest.status === 'verified' || manifest.status === 'verified-gold') {
    if (manifest.quality.overall < 80) {
      errors.push(
        `Verified resource must have overall quality >= 80, but found ${manifest.quality.overall}.`
      );
    }
  }

  // 5. Check Intent completeness
  if (manifest.intent.idealFor.length === 0) {
    warnings.push(`Intent should declare at least one 'idealFor' context.`);
  }
  if (manifest.intent.avoidFor.length === 0) {
    warnings.push(`Intent should declare at least one 'avoidFor' context.`);
  }
  if (manifest.intent.jobs.length === 0) {
    warnings.push(`Intent should declare at least one 'jobs' string.`);
  }

  // 6. Check Viewport verification
  if (!manifest.responsive.verifiedWidths.includes(360)) {
    warnings.push(`Responsive spec missing verified 360px mobile width.`);
  }
  if (!manifest.responsive.verifiedWidths.includes(1440)) {
    warnings.push(`Responsive spec missing verified 1440px desktop width.`);
  }

  // 7. Validate Imports / Dependencies in Resource Files
  const declaredDeps = new Set<string>([
    'react',
    'react-dom',
    ...manifest.dependencies.map((d) => d.package),
    ...manifest.registry.dependencies,
  ]);

  for (const file of manifest.files) {
    if (file.kind === 'component' || file.kind === 'utility') {
      const fullPath = path.join(resourceDir, file.path);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        // Simple regex to extract package import specifiers
        const importRegex = /(?:import|export)\s+(?:[\w*\s{},]*\s+from\s+)?['"]([^'"]+)['"]/g;
        let match: RegExpExecArray | null;
        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];
          if (!importPath) continue;

          // Ignore relative imports and node builtins
          if (importPath.startsWith('.') || importPath.startsWith('/') || importPath.startsWith('node:')) {
            continue;
          }
          // Ignore @tessellate internal packages
          if (importPath.startsWith('@tessellate/')) {
            continue;
          }

          // Extract package name (e.g. "lucide-react" or "@radix-ui/react-slot")
          const parts = importPath.split('/');
          const pkgName = importPath.startsWith('@') ? `${parts[0]}/${parts[1]}` : (parts[0] ?? importPath);

          if (!declaredDeps.has(pkgName)) {
            errors.push(
              `File '${file.path}' imports undeclared dependency '${pkgName}'. Must be declared in manifest.dependencies.`
            );
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    resourceId,
    slug,
    errors,
    warnings,
    manifest,
  };
}
