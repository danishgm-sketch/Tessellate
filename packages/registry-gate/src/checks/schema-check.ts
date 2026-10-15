import { ResourceManifestSchema, type ResourceManifest } from '@tessellate/schemas';
import type { GateCheckResult } from '../types.js';

export function checkSchemaValidity(manifestData: unknown): {
  result: GateCheckResult;
  manifest?: ResourceManifest;
} {
  if (!manifestData || typeof manifestData !== 'object') {
    return {
      result: {
        id: 'schema-validation',
        name: 'ResourceManifest Schema Compliance',
        category: 'schema',
        status: 'fail',
        score: 0,
        details: 'Missing or malformed manifest.json object.',
        remediation: 'Ensure resource includes a valid manifest.json file matching ResourceManifest schema.',
      },
    };
  }

  const parsed = ResourceManifestSchema.safeParse(manifestData);

  if (!parsed.success) {
    const errorIssues = parsed.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');

    return {
      result: {
        id: 'schema-validation',
        name: 'ResourceManifest Schema Compliance',
        category: 'schema',
        status: 'fail',
        score: 20,
        details: `Validation failed: ${errorIssues}`,
        remediation: 'Run "tess validate <path-to-manifest.json>" to review and resolve schema errors.',
      },
    };
  }

  return {
    result: {
      id: 'schema-validation',
      name: 'ResourceManifest Schema Compliance',
      category: 'schema',
      status: 'pass',
      score: 100,
      details: `Resource manifest conforms 100% to canonical ResourceManifestSchema (v${parsed.data.version || '1.0.0'}).`,
    },
    manifest: parsed.data,
  };
}
